import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  MapPin, Clock, Coins, Plus, Trash2,
  ChevronUp, ChevronDown, Save, ArrowLeft, X
} from 'lucide-react';
import PlaceSearchModal from '../components/map/PlaceSearchModal';
// 🚀 [추가] 챗봇 컴포넌트 임포트 (프로젝트 구조에 맞게 경로 확인)
import { TravelChatbot } from '../components/TravelChatbot'; 
import { getTripById, addPlace, deletePlace, reorderPlaces, type TripResponse, type DayScheduleResponse, type PlaceResponse } from '../service/tripService';

const PlannerPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  const [trip, setTrip] = useState<TripResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [selectedPlace, setSelectedPlace] = useState<PlaceResponse | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const currentDaySchedule = trip?.schedules.find((s) => s.dayNumber === selectedDay);
  const currentPlaces = currentDaySchedule?.places ?? [];
  const totalCost = currentPlaces.reduce((sum, p) => sum + p.estimatedCost, 0);

  const markersRef = useRef<any[]>([]);
  const polylineRef = useRef<any>(null);
  const activeInfoWindowRef = useRef<any>(null); 

  // 🚀 [추가] 챗봇에 실시간 전송할 장소 이름 목록 가공 함수
  const extractPlaceNames = (): string[] => {
    if (!trip || !trip.schedules) return [];
    
    // 전체 일정을 통째로 보내주고 싶다면 flatMap을, 
    // 유저가 선택한 특정 일차(dayNumber)의 동선만 집중 학습시키고 싶다면 아래처럼 가공할 수 있습니다.
    // 여기서는 '전체 동선'을 1차원 string 배열로 평탄화하여 수집합니다.
    return trip.schedules.flatMap((day: DayScheduleResponse) => 
      day.places
        .filter((place: PlaceResponse) => place.placeCategory !== '교통')
        .map((place: PlaceResponse) => place.placeName)
    );
  };

  // 카카오맵 초기화
  useEffect(() => {
    if (!mapRef.current || !trip) return;
    const kakao = (window as any).kakao;
    if (!kakao) return;

    kakao.maps.load(() => {
      const options = {
        center: new kakao.maps.LatLng(37.5665, 126.9780),
        level: 7,
      };
      mapInstanceRef.current = new kakao.maps.Map(mapRef.current, options);
    });
  }, [trip]);

  // 마커 추가 함수
  const addMarker = (kakao: any, position: any, place: PlaceResponse, order: number) => {
    const markerEl = document.createElement('div');
    markerEl.style.cssText = `
      width:28px;height:28px;border-radius:50%;
      background:#178DD7;color:#fff;
      display:flex;align-items:center;justify-content:center;
      font-weight:bold;font-size:13px;
      border:2px solid #fff;
      box-shadow:0 2px 6px rgba(0,0,0,0.3);
      cursor:pointer;
    `;
    markerEl.innerText = String(order);

    const overlay = new kakao.maps.CustomOverlay({ 
      position, 
      content: markerEl, 
      yAnchor: 1 
    });
    
    overlay.setMap(mapInstanceRef.current);
    markersRef.current.push(overlay);

    markerEl.addEventListener('click', () => {
      if (activeInfoWindowRef.current) {
        activeInfoWindowRef.current.close();
      }

      const detailLinkHtml = place.kakaoPlaceId
        ? `<div style="border-top: 1px solid #f1f3f5; padding-top: 8px; text-align: right;">
             <a href="https://place.map.kakao.com/${place.kakaoPlaceId}" target="_blank" rel="noopener noreferrer" 
                style="font-size: 11px; color: #178DD7; font-weight: 500; text-decoration: none; display: inline-block;">
                상세 정보 보러가기 ↗
             </a>
           </div>`
        : `<div style="border-top: 1px solid #f1f3f5; padding-top: 8px; text-align: right;">
             <span style="font-size: 11px; color: #adb5bd;">상세 정보 없음</span>
           </div>`;

      const contentString = `
        <div style="padding: 12px; width: 200px; box-sizing: border-box; font-family: sans-serif; line-height: 1.4;">
          <div style="font-size: 13px; font-weight: 600; color: #212529; margin-bottom: 4px; word-break: break-all;">${place.placeName}</div>
          <div style="font-size: 11px; color: #6c757d; margin-bottom: 8px; white-space: normal; word-break: break-all;">${place.address}</div>
          ${detailLinkHtml}
        </div>
      `;

      const infoWindow = new kakao.maps.InfoWindow({
        content: contentString,
        removable: true
      });

      infoWindow.setPosition(position);
      infoWindow.open(mapInstanceRef.current);
      
      activeInfoWindowRef.current = infoWindow;
      setSelectedPlace(null);
    });
  };

  // 마커 및 선(Polyline) 업데이트 useEffect
  useEffect(() => {
    const kakao = (window as any).kakao;
    if (!kakao || !mapInstanceRef.current) return;

    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];
    
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
    }
    
    if (activeInfoWindowRef.current) {
      activeInfoWindowRef.current.close();
      activeInfoWindowRef.current = null;
    }

    if (currentPlaces.length === 0) return;

    const bounds = new kakao.maps.LatLngBounds();
    const linePath: any[] = [];

    currentPlaces.forEach((place) => {
      if (place.placeCategory === '교통') return;

      let lat = Number(place.latitude);
      let lng = Number(place.longitude);

      if (lat > 100 && lng < 100) {
        const temp = lat;
        lat = lng;
        lng = temp;
      }

      if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
        const position = new kakao.maps.LatLng(lat, lng);
        addMarker(kakao, position, place, place.placeOrder);
        bounds.extend(position);
        linePath.push(position);
      }
    });

    if (linePath.length > 1) {
      polylineRef.current = new kakao.maps.Polyline({
        path: linePath,
        strokeWeight: 3,
        strokeColor: '#178DD7',
        strokeOpacity: 0.8,
        strokeStyle: 'solid'
      });
      polylineRef.current.setMap(mapInstanceRef.current);
    }

    if (!bounds.isEmpty()) {
      mapInstanceRef.current.setBounds(bounds);
      if (currentPlaces.length === 1) {
        mapInstanceRef.current.setLevel(4);
      }
    }
  }, [selectedDay, currentPlaces]);


  // 여행 데이터 조회
  useEffect(() => {
    const fetchTrip = async () => {
      if (!id) return;
      try {
        const data = await getTripById(Number(id));
        setTrip(data);
      } catch (err) {
        console.error(err);
        alert('여행 정보를 불러오지 못했어요.');
        navigate('/trips');
      } finally {
        setIsLoading(false);
      }
    };
    fetchTrip();
  }, [id]);

  // 장소 삭제
  const handleDeletePlace = async (placeId: number): Promise<void> => {
    if (!id) return;
    try {
      const updated = await deletePlace(Number(id), selectedDay, placeId);
      setTrip(updated);
      if (selectedPlace?.placeId === placeId) setSelectedPlace(null);
    } catch (err) {
      alert('장소 삭제에 실패했어요.');
    }
  };

  // 장소 순서 변경
  const handleMovePlace = async (placeId: number, direction: 'up' | 'down'): Promise<void> => {
    if (!id || !currentDaySchedule) return;
    const places = [...currentPlaces];
    const idx = places.findIndex((p) => p.placeId === placeId);
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === places.length - 1) return;
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    [places[idx], places[swapIdx]] = [places[swapIdx], places[idx]];
    const placeIds = places.map((p) => p.placeId);
    try {
      const updated = await reorderPlaces(Number(id), selectedDay, placeIds);
      setTrip(updated);
    } catch (err) {
      alert('순서 변경에 실패했어요.');
    }
  };

  // 장소 추가
const handleAddPlace = async (
    kakaoPlace: any, 
    isAccommodation: boolean
  ): Promise<void> => {
    if (!id) return;
    try {
      // 0. [중요] API 호출 전, 현재 화면에 정렬되어 있는 기존 장소들의 ID 순서를 백업합니다.
      const existingPlaceIds = currentPlaces.map((p) => p.placeId);

      const newPlaceData = {
        placeName: kakaoPlace.place_name,
        placeCategory: kakaoPlace.category_name,
        address: kakaoPlace.road_address_name || kakaoPlace.address_name,
        latitude: parseFloat(kakaoPlace.y),
        longitude: parseFloat(kakaoPlace.x),
        visitTime: '09:00',
        duration: 60,
        estimatedCost: 0,
        memo: '',
        kakaoPlaceId: kakaoPlace.id,
      };

      // 1. 장소 추가 API 호출
      const response = await addPlace(Number(id), selectedDay, newPlaceData);

console.log('addPlace response:', response);  // 👈 추가
console.log('existingPlaceIds:', existingPlaceIds);  // 👈 추가
      
      // 2. 서버에서 추가 완료 후 반환된 해당 일차의 최신 장소 리스트를 가져옵니다.
      const updatedSchedule = response.schedules.find((s: any) => s.dayNumber === selectedDay);
      const updatedPlaces = updatedSchedule ? updatedSchedule.places : [];
      console.log('updatedPlaces:', updatedPlaces);  // 👈 추가

      if (updatedPlaces.length === 0) return;

      // 3. 방금 추가된 장소(서버가 새로 생성한 객체)를 찾습니다.
      // 기존 백업해 둔 ID 목록에 없는 ID가 새로 추가된 장소입니다.
      const newPlace = updatedPlaces.find((p: any) => !existingPlaceIds.includes(p.placeId));

      let finalPlaceIds: number[] = [];

      // 4. 숙소인 경우와 일반 장소인 경우 나누어 ID 배열 조립
      if (isAccommodation && newPlace) {
        // [새 숙소 ID] + [기존에 화면에 있던 장소 ID 순서 그대로]
        finalPlaceIds = [newPlace.placeId, ...existingPlaceIds];
      } else {
        // 일반 장소라면 기존 순서 뒤에 새 장소 ID를 붙임
        finalPlaceIds = [...existingPlaceIds, ...(newPlace ? [newPlace.placeId] : [])];
      }

      console.log('isAccommodation:', isAccommodation);
console.log('newPlace:', newPlace);
console.log('finalPlaceIds:', finalPlaceIds);

      // 5. 확정된 순서 배열을 서버에 전달하여 순서 재정렬
      const finalData = await reorderPlaces(Number(id), selectedDay, finalPlaceIds);
      
      
      // 6. 화면 리렌더링을 위해 전체 상태 업데이트 및 모달 닫기
      setTrip({ ...finalData });
      setShowModal(false);
      
    } catch (err) {
      console.error("장소 추가 및 순서 정렬 중 에러 발생:", err);
      alert('장소 추가에 실패했습니다.');
    }
  };

  // 저장
  const handleSave = async (): Promise<void> => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      navigate(`/trips/${id}`);
    }, 500);
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#f8f9fa]">
        <div className="flex flex-col items-center gap-3 text-[#6c757d]">
          <svg className="animate-spin w-8 h-8 text-[#178DD7]" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <span className="text-[13px]">일정을 불러오는 중...</span>
        </div>
      </div>
    );
  }

  if (!trip) return null;

  return (
    <div className="h-screen flex flex-col font-sans antialiased text-[#212529] overflow-hidden relative">

      {/* 네비게이션 */}
      <nav className="bg-white border-b border-[#e9ecef] px-5 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/trips/${id}`)}
            className="flex items-center gap-1 text-[13px] text-[#6c757d] hover:text-[#212529] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            돌아가기
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-[#178DD7] flex items-center justify-center">
              <MapPin className="text-white w-3.5 h-3.5" />
            </div>
            <span className="text-[14px] font-medium">{trip.title}</span>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-[13px] font-medium text-white transition-colors
            ${isSaving ? 'bg-[#7ec2ed] cursor-not-allowed' : 'bg-[#178DD7] hover:bg-[#1278ba] cursor-pointer'}`}
        >
          <Save className="w-3.5 h-3.5" />
          {isSaving ? '저장 중...' : '완료'}
        </button>
      </nav>

      <div className="flex flex-1 overflow-hidden">

        {/* 왼쪽 사이드바 */}
        <div className="w-[340px] flex-shrink-0 flex flex-col border-r border-[#e9ecef] bg-white overflow-hidden">
          <div className="px-4 py-3 border-b border-[#e9ecef]">
            <div className="text-[13px] text-[#6c757d]">
              {trip.startDate} – {trip.endDate} · {trip.days}일 · 예산 {trip.budget.toLocaleString()}원
            </div>
          </div>

          {/* 날짜 탭 */}
          <div className="flex gap-1.5 px-4 py-2.5 border-b border-[#e9ecef] overflow-x-auto flex-shrink-0">
            {trip.schedules.map((day) => (
              <button
                key={day.dayNumber}
                onClick={() => setSelectedDay(day.dayNumber)}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors flex-shrink-0
                  ${selectedDay === day.dayNumber
                    ? 'bg-[#178DD7] text-white'
                    : 'border border-[#dee2e6] text-[#6c757d] hover:bg-gray-50'}`}
              >
                {day.dayNumber}일차
              </button>
            ))}
          </div>

          {/* 날짜 테마 */}
          {currentDaySchedule && (
            <div className="px-4 py-2 border-b border-[#f1f3f5] bg-[#f8f9fa]">
              <span className="text-[12px] text-[#6c757d]">{currentDaySchedule.theme}</span>
            </div>
          )}

          {/* 장소 목록 */}
          <div className="flex-1 overflow-y-auto px-3 py-2">
            {currentPlaces.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-[13px] text-[#adb5bd]">
                <MapPin className="w-8 h-8 mb-2 opacity-30" />
                장소를 추가해보세요
              </div>
            ) : (
              <div className="flex flex-col gap-2 py-1">
                {currentPlaces.map((place) => (
                  <div
                    key={place.placeId}
                    onClick={() => {
                      setSelectedPlace(place); 
                      
                      if (activeInfoWindowRef.current) {
                        activeInfoWindowRef.current.close();
                        activeInfoWindowRef.current = null;
                      }

                      const kakao = (window as any).kakao;
                      if (kakao && mapInstanceRef.current) {
                        const lat = Number(place.latitude);
                        const lng = Number(place.longitude);
                        if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
                          mapInstanceRef.current.panTo(new kakao.maps.LatLng(lat, lng));
                        }
                      }
                    }}
                    className={`border rounded-lg p-3 cursor-pointer transition-colors
                      ${selectedPlace?.placeId === place.placeId
                        ? 'border-[#178DD7] bg-[#E6F1FB]'
                        : 'border-[#e9ecef] hover:border-[#ced4da] bg-white'}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-[#178DD7] text-white text-[10px] font-medium flex items-center justify-center flex-shrink-0">
                          {place.placeOrder}
                        </div>
                        <span className="text-[13px] font-medium text-[#212529]">{place.placeName}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleMovePlace(place.placeId, 'up'); }}
                          className="w-5 h-5 flex items-center justify-center text-[#adb5bd] hover:text-[#6c757d] transition-colors"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleMovePlace(place.placeId, 'down'); }}
                          className="w-5 h-5 flex items-center justify-center text-[#adb5bd] hover:text-[#6c757d] transition-colors"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeletePlace(place.placeId); }}
                          className="w-5 h-5 flex items-center justify-center text-[#adb5bd] hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="text-[11px] text-[#6c757d] ml-7 mb-1">{place.placeCategory}</div>
                    <div className="flex gap-3 ml-7">
                      <span className="flex items-center gap-1 text-[11px] text-[#6c757d]">
                        <Clock className="w-3 h-3" />
                        {place.visitTime} · {place.duration}분
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-[#6c757d]">
                        <Coins className="w-3 h-3" />
                        {place.estimatedCost === 0 ? '무료' : `약 ${place.estimatedCost.toLocaleString()}원`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 하단 예상 비용 */}
          <div className="border-t border-[#e9ecef] px-4 py-3 flex-shrink-0 bg-white">
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[12px] text-[#6c757d]">오늘 예상 비용</span>
              <span className="text-[13px] font-medium text-[#212529]">
                {totalCost.toLocaleString()}원
              </span>
            </div>
            <div className="text-[10px] text-[#adb5bd] mb-2.5">※ AI 추정 금액으로 실제와 다를 수 있어요</div>
            <button
              onClick={() => setShowModal(true)}
              className="w-full py-2 rounded-lg border border-dashed border-[#ced4da] text-[13px] text-[#6c757d] hover:bg-[#f8f9fa] transition-colors flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              장소 추가
            </button>
          </div>
        </div>

        {/* 오른쪽 지도 영역 */}
        <div className="flex-1 relative">
          <div ref={mapRef} className="w-full h-full" />

          {/* 장소 검색바 */}
          <div className="absolute top-3 left-3 right-3 flex gap-2 z-10">
            <input
              className="flex-1 py-2 px-3 rounded-lg border border-[#e9ecef] text-sm bg-white shadow-sm focus:outline-none focus:border-[#178DD7]"
              placeholder="장소 검색..."
              readOnly
              onClick={() => setShowModal(true)}
            />
          </div>

          {/* 선택된 장소 요약 창 */}
          {selectedPlace && (
            <div className="absolute top-16 left-3 bg-white border border-[#e9ecef] rounded-xl p-3 w-52 shadow-lg z-10">
              <div className="flex items-start justify-between gap-2 mb-0.5">
                <div className="text-[13px] font-medium text-[#212529] break-all pr-1">
                  {selectedPlace.placeName}
                </div>
                <button
                  onClick={() => setSelectedPlace(null)}
                  className="text-[#adb5bd] hover:text-[#6c757d] transition-colors p-0.5 rounded-md hover:bg-[#f1f3f5] flex-shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="text-[11px] text-[#178DD7] mb-1">{selectedPlace.placeCategory}</div>
              <div className="text-[11px] text-[#6c757d] mb-1.5">{selectedPlace.address}</div>
              {selectedPlace.visitTime && (
                <div className="text-[11px] text-[#6c757d] mt-1 mb-2">
                  🕐 {selectedPlace.visitTime} · {selectedPlace.duration}분
                </div>
              )}
              <div className="border-t border-[#f1f3f5] pt-2 text-right">
                <a 
                  href={`https://place.map.kakao.com/${selectedPlace.kakaoPlaceId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-[#178DD7] hover:underline"
                >
                  카카오맵 상세 정보 ↗
                </a>
              </div>
            </div>
          )}

          {/* 예산 바 */}
          <div className="absolute bottom-3 left-3 right-3 bg-white border border-[#e9ecef] rounded-xl px-4 py-2.5 shadow-sm z-10">
            <div className="flex items-center gap-3 mb-1">
              <span className="text-[12px] text-[#6c757d]">전체 예산</span>
              <div className="flex-1 h-1.5 bg-[#f1f3f5] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#178DD7] rounded-full transition-all"
                  style={{ width: `${Math.min((trip.schedules.flatMap(s => s.places).reduce((sum, p) => sum + p.estimatedCost, 0) / trip.budget) * 100, 100)}%` }}
                />
              </div>
              <span className="text-[12px] font-medium text-[#212529]">
                {trip.schedules.flatMap(s => s.places).reduce((sum, p) => sum + p.estimatedCost, 0).toLocaleString()}원 / {trip.budget.toLocaleString()}원
              </span>
            </div>
            <div className="text-[10px] text-[#adb5bd]">※ AI 추정 금액으로 실제와 다를 수 있어요</div>
          </div>
        </div>
      </div>

      {showModal && (
        <PlaceSearchModal
          onClose={() => setShowModal(false)}
          onSelect={handleAddPlace}
        />
      )}

      {/* ========================================================= */}
      {/* 🚀 [추가] 우측 하단 고정 AI 가이드 여행 챗봇 컴포넌트 조립 */}
      {/* ========================================================= */}
      <TravelChatbot currentPlanPlaces={extractPlaceNames()} />
      
    </div>
  );
};

export default PlannerPage;