import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin, Clock, Coins, Plus, Trash2,
  ChevronUp, ChevronDown, Save, ArrowLeft
} from 'lucide-react';
import PlaceSearchModal from '../components/map/PlaceSearchModal';

// ─────────────────────────────────────────
// 타입 정의
// ─────────────────────────────────────────
interface SchedulePlace {
  id: number;
  order: number;
  placeName: string;
  placeCategory: string;
  address: string;
  latitude: number;
  longitude: number;
  visitTime: string;
  duration: number;
  estimatedCost: number;
  memo: string;
  kakaoPlaceId: string;
}

interface DaySchedule {
  dayNumber: number;
  theme: string;
  places: SchedulePlace[];
}

// ─────────────────────────────────────────
// 더미 데이터 (백엔드 연동 전)
// ─────────────────────────────────────────
const DUMMY_SCHEDULES: DaySchedule[] = [
  {
    dayNumber: 1,
    theme: '동부 자연 탐방',
    places: [
      { id: 1, order: 1, placeName: '성산일출봉', placeCategory: '관광명소', address: '제주 서귀포시 성산읍', latitude: 33.4584, longitude: 126.9415, visitTime: '09:00', duration: 120, estimatedCost: 5000, memo: '', kakaoPlaceId: 'p1' },
      { id: 2, order: 2, placeName: '섭지코지', placeCategory: '관광명소', address: '제주 서귀포시 성산읍', latitude: 33.4296, longitude: 126.9298, visitTime: '11:30', duration: 60, estimatedCost: 0, memo: '', kakaoPlaceId: 'p2' },
      { id: 3, order: 3, placeName: '흑돼지거리', placeCategory: '음식점', address: '제주시 연동', latitude: 33.4890, longitude: 126.4983, visitTime: '13:00', duration: 60, estimatedCost: 20000, memo: '', kakaoPlaceId: 'p3' },
      { id: 4, order: 4, placeName: '우도', placeCategory: '관광명소', address: '제주 제주시 우도면', latitude: 33.5039, longitude: 126.9527, visitTime: '15:00', duration: 180, estimatedCost: 15000, memo: '', kakaoPlaceId: 'p4' },
    ],
  },
  {
    dayNumber: 2,
    theme: '서부 카페 투어',
    places: [
      { id: 5, order: 1, placeName: '한림공원', placeCategory: '관광명소', address: '제주 제주시 한림읍', latitude: 33.4143, longitude: 126.2608, visitTime: '10:00', duration: 90, estimatedCost: 12000, memo: '', kakaoPlaceId: 'p5' },
      { id: 6, order: 2, placeName: '협재해수욕장', placeCategory: '해변', address: '제주 제주시 한림읍', latitude: 33.3942, longitude: 126.2394, visitTime: '12:00', duration: 120, estimatedCost: 0, memo: '', kakaoPlaceId: 'p6' },
    ],
  },
  { dayNumber: 3, theme: '한라산 트레킹', places: [] },
  { dayNumber: 4, theme: '남부 & 출발', places: [] },
];

// ─────────────────────────────────────────
// 컴포넌트
// ─────────────────────────────────────────
const PlannerPage: React.FC = () => {
  const navigate = useNavigate();
  const mapRef = useRef<HTMLDivElement>(null);

  const [schedules, setSchedules] = useState<DaySchedule[]>(DUMMY_SCHEDULES);
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [selectedPlace, setSelectedPlace] = useState<SchedulePlace | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const currentDaySchedule = schedules.find((s) => s.dayNumber === selectedDay);
  const currentPlaces = currentDaySchedule?.places ?? [];

  const totalCost = currentPlaces.reduce((sum, p) => sum + p.estimatedCost, 0);

  // 카카오맵 초기화
  useEffect(() => {
    if (!mapRef.current) return;
    // 💡 추후 카카오맵 SDK 로드 후 초기화할 공간
    // window.kakao.maps.load(() => {
    //   const map = new window.kakao.maps.Map(mapRef.current, {
    //     center: new window.kakao.maps.LatLng(33.4890, 126.4983),
    //     level: 9,
    //   });
    // });
  }, []);

  // 마커 업데이트 (날짜 변경 or 장소 변경 시)
  useEffect(() => {
    // 💡 추후 마커 업데이트 로직 추가
  }, [selectedDay, schedules]);

  // 장소 삭제
  const handleDeletePlace = (placeId: number): void => {
    setSchedules((prev) =>
      prev.map((day) =>
        day.dayNumber === selectedDay
          ? {
              ...day,
              places: day.places
                .filter((p) => p.id !== placeId)
                .map((p, i) => ({ ...p, order: i + 1 })),
            }
          : day
      )
    );
    if (selectedPlace?.id === placeId) setSelectedPlace(null);
  };

  // 장소 순서 변경
  const handleMovePlace = (placeId: number, direction: 'up' | 'down'): void => {
    setSchedules((prev) =>
      prev.map((day) => {
        if (day.dayNumber !== selectedDay) return day;
        const places = [...day.places];
        const idx = places.findIndex((p) => p.id === placeId);
        if (direction === 'up' && idx === 0) return day;
        if (direction === 'down' && idx === places.length - 1) return day;
        const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
        [places[idx], places[swapIdx]] = [places[swapIdx], places[idx]];
        return { ...day, places: places.map((p, i) => ({ ...p, order: i + 1 })) };
      })
    );
  };

  // 장소 추가 (모달에서 선택 시)
  const handleAddPlace = (kakaoPlace: { id: string; place_name: string; category_name: string; road_address_name: string; address_name: string; x: string; y: string }): void => {
    const newPlace: SchedulePlace = {
      id: Date.now(),
      order: currentPlaces.length + 1,
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
    setSchedules((prev) =>
      prev.map((day) =>
        day.dayNumber === selectedDay
          ? { ...day, places: [...day.places, newPlace] }
          : day
      )
    );
    setShowModal(false);
  };

  // 저장
  const handleSave = async (): Promise<void> => {
    setIsSaving(true);
    try {
      // 💡 추후 백엔드 저장 API 연동할 공간
      console.log('일정 저장:', schedules);
      setTimeout(() => {
        setIsSaving(false);
        alert('일정이 저장되었어요!');
      }, 800);
    } catch {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-screen flex flex-col font-sans antialiased text-[#212529] overflow-hidden">

      {/* 네비게이션 */}
      <nav className="bg-white border-b border-[#e9ecef] px-5 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/trips')}
            className="flex items-center gap-1 text-[13px] text-[#6c757d] hover:text-[#212529] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            내 여행
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-[#178DD7] flex items-center justify-center">
              <MapPin className="text-white w-3.5 h-3.5" />
            </div>
            <span className="text-[14px] font-medium">제주도 힐링 여행</span>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-[13px] font-medium text-white transition-colors
            ${isSaving ? 'bg-[#7ec2ed] cursor-not-allowed' : 'bg-[#178DD7] hover:bg-[#1278ba] cursor-pointer'}`}
        >
          <Save className="w-3.5 h-3.5" />
          {isSaving ? '저장 중...' : '저장'}
        </button>
      </nav>

      {/* 메인 컨텐츠 (사이드바 + 지도) */}
      <div className="flex flex-1 overflow-hidden">

        {/* 왼쪽 사이드바 */}
        <div className="w-[340px] flex-shrink-0 flex flex-col border-r border-[#e9ecef] bg-white overflow-hidden">

          {/* 여행 정보 */}
          <div className="px-4 py-3 border-b border-[#e9ecef]">
            <div className="text-[13px] text-[#6c757d]">2024.08.15 – 08.18 · 4일 · 예산 50만원</div>
          </div>

          {/* 날짜 탭 */}
          <div className="flex gap-1.5 px-4 py-2.5 border-b border-[#e9ecef] overflow-x-auto flex-shrink-0">
            {schedules.map((day) => (
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
                    key={place.id}
                    onClick={() => setSelectedPlace(place)}
                    className={`border rounded-lg p-3 cursor-pointer transition-colors
                      ${selectedPlace?.id === place.id
                        ? 'border-[#178DD7] bg-[#E6F1FB]'
                        : 'border-[#e9ecef] hover:border-[#ced4da] bg-white'}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-[#178DD7] text-white text-[10px] font-medium flex items-center justify-center flex-shrink-0">
                          {place.order}
                        </div>
                        <span className="text-[13px] font-medium text-[#212529]">{place.placeName}</span>
                      </div>
                      {/* 순서/삭제 버튼 */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleMovePlace(place.id, 'up'); }}
                          className="w-5 h-5 flex items-center justify-center text-[#adb5bd] hover:text-[#6c757d] transition-colors"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleMovePlace(place.id, 'down'); }}
                          className="w-5 h-5 flex items-center justify-center text-[#adb5bd] hover:text-[#6c757d] transition-colors"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeletePlace(place.id); }}
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
                        {place.estimatedCost === 0 ? '무료' : `${place.estimatedCost.toLocaleString()}원`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 하단: 예상 비용 + 장소 추가 버튼 */}
          <div className="border-t border-[#e9ecef] px-4 py-3 flex-shrink-0 bg-white">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[12px] text-[#6c757d]">오늘 예상 비용</span>
              <span className="text-[13px] font-medium text-[#212529]">
                {totalCost.toLocaleString()}원
              </span>
            </div>
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
        <div className="flex-1 relative bg-[#e8f0e8]">

          {/* 💡 카카오맵 SDK 연동 후 mapRef로 교체 */}
          <div ref={mapRef} className="w-full h-full">

            {/* 임시 지도 UI (카카오맵 연동 전) */}
            <div className="w-full h-full relative overflow-hidden">
              {/* 도로 */}
              <div className="absolute top-[20%] left-0 right-0 h-[2px] bg-white/60"></div>
              <div className="absolute top-[45%] left-0 right-0 h-[2px] bg-white/60"></div>
              <div className="absolute top-[70%] left-0 right-0 h-[2px] bg-white/60"></div>
              <div className="absolute left-[30%] top-0 bottom-0 w-[2px] bg-white/60"></div>
              <div className="absolute left-[60%] top-0 bottom-0 w-[2px] bg-white/60"></div>

              {/* 블록 */}
              <div className="absolute top-[22%] left-[31%] w-20 h-12 bg-white/25 rounded-md"></div>
              <div className="absolute top-[47%] left-[61%] w-16 h-10 bg-white/25 rounded-md"></div>
              <div className="absolute top-[22%] left-[65%] w-20 h-14 bg-white/25 rounded-md"></div>

              {/* 이동 경로 선 */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <polyline
                  points="220,160 340,240 460,300 560,180"
                  fill="none"
                  stroke="#178DD7"
                  strokeWidth="2"
                  strokeDasharray="6,4"
                  opacity="0.7"
                />
              </svg>

              {/* 마커 */}
              {currentPlaces.map((place, index) => {
                const positions = [
                  { left: '200px', top: '130px' },
                  { left: '320px', top: '210px' },
                  { left: '440px', top: '270px' },
                  { left: '540px', top: '150px' },
                ];
                const pos = positions[index] ?? { left: `${200 + index * 80}px`, top: '200px' };
                return (
                  <div
                    key={place.id}
                    className="absolute flex flex-col items-center cursor-pointer"
                    style={{ left: pos.left, top: pos.top }}
                    onClick={() => setSelectedPlace(place)}
                  >
                    <div className={`w-7 h-7 rounded-full text-white text-xs font-medium flex items-center justify-center border-2 border-white shadow-md transition-transform
                      ${selectedPlace?.id === place.id ? 'bg-[#E8540A] scale-125' : 'bg-[#178DD7]'}`}>
                      {place.order}
                    </div>
                    <div className="text-[10px] font-medium text-[#333] bg-white/90 px-1.5 py-0.5 rounded-full mt-1 shadow-sm whitespace-nowrap">
                      {place.placeName}
                    </div>
                  </div>
                );
              })}

              {/* 선택된 장소 말풍선 */}
              {selectedPlace && (
                <div className="absolute bg-white border border-[#e9ecef] rounded-xl p-3 w-48 shadow-lg"
                  style={{ left: '240px', top: '90px' }}>
                  <div className="text-[13px] font-medium text-[#212529] mb-0.5">{selectedPlace.placeName}</div>
                  <div className="text-[11px] text-[#178DD7] mb-1">{selectedPlace.placeCategory}</div>
                  <div className="text-[11px] text-[#6c757d]">{selectedPlace.address}</div>
                </div>
              )}

              {/* 검색바 */}
              <div className="absolute top-3 left-3 right-3 flex gap-2">
                <input
                  className="flex-1 py-2 px-3 rounded-lg border border-[#e9ecef] text-sm bg-white shadow-sm focus:outline-none focus:border-[#178DD7]"
                  placeholder="장소 검색..."
                  readOnly
                  onClick={() => setShowModal(true)}
                />
              </div>

              {/* 카카오맵 연동 안내 */}
              <div className="absolute bottom-14 left-1/2 -translate-x-1/2 bg-white/90 text-[11px] text-[#6c757d] px-3 py-1.5 rounded-full border border-[#e9ecef] whitespace-nowrap">
                💡 카카오맵 API 연동 후 실제 지도가 표시돼요
              </div>

              {/* 예산 바 */}
              <div className="absolute bottom-3 left-3 right-3 bg-white border border-[#e9ecef] rounded-xl px-4 py-2.5 flex items-center gap-3 shadow-sm">
                <span className="text-[12px] text-[#6c757d]">전체 예산</span>
                <div className="flex-1 h-1.5 bg-[#f1f3f5] rounded-full overflow-hidden">
                  <div className="h-full bg-[#178DD7] rounded-full" style={{ width: '62%' }}></div>
                </div>
                <span className="text-[12px] font-medium text-[#212529]">31만원 / 50만원</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 장소 검색 모달 */}
      {showModal && (
        <PlaceSearchModal
          onClose={() => setShowModal(false)}
          onSelect={handleAddPlace}
        />
      )}
    </div>
  );
};

export default PlannerPage;