import React, { useEffect, useRef } from 'react';

interface PreviewPlace {
  placeName: string;
  latitude: number;
  longitude: number;
  visitTime: string;
  duration: number; // 분 단위
}

interface TripPreviewCardProps {
  tripId: number;
  title: string;
  places: PreviewPlace[];
}

const TripPreviewCard: React.FC<TripPreviewCardProps> = ({ tripId, title, places }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const kakao = (window as any).kakao;
    if (!kakao || !mapContainerRef.current || places.length === 0) return;

    kakao.maps.load(() => {
      // 1. 지도 초기화 (드래그, 줌 비활성화하여 정적 위젯처럼 처리)
      const options = {
        center: new kakao.maps.LatLng(places[0].latitude, places[0].longitude),
        level: 5,
        draggable: false, // 🚀 메인페이지용이라 지도 이동 막기
        zoomable: false,   // 🚀 줌 막기
      };
      
      const map = new kakao.maps.Map(mapContainerRef.current, options);
      const bounds = new kakao.maps.LatLngBounds();
      const linePath: any[] = [];

      // 2. 마커 및 선 그리기
      places.forEach((place, index) => {
        const position = new kakao.maps.LatLng(place.latitude, place.longitude);
        linePath.push(position);
        bounds.extend(position);

        // 이미지와 동일한 파란색 원형 숫자 마커 생성
        const markerEl = document.createElement('div');
        markerEl.style.cssText = `
          width: 24px; height: 24px; border-radius: 50%;
          background: #178DD7; color: #fff;
          display: flex; align-items: center; justify-content: center;
          font-weight: bold; font-size: 11px;
          border: 2px solid #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        `;
        markerEl.innerText = String(index + 1);

        const overlay = new kakao.maps.CustomOverlay({
          position,
          content: markerEl,
          yAnchor: 0.5,
        });
        overlay.setMap(map);
      });

      // 장소가 2개 이상이면 선으로 연결
      if (linePath.length > 1) {
        const polyline = new kakao.maps.Polyline({
          path: linePath,
          strokeWeight: 2,
          strokeColor: '#178DD7',
          strokeOpacity: 0.6,
          strokeStyle: 'dash', // 대시 스타일로 부드럽게 표현
        });
        polyline.setMap(map);
      }

      // 모든 마커가 보이도록 지도 범위 조정
      map.setBounds(bounds);
    });
  }, [places]);

  // 분 단위를 시간/분으로 변환해주는 헬퍼 함수
  const formatDuration = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h > 0) return m > 0 ? `${h}시간 ${m}분` : `${h}시간`;
    return `${mins}분`;
  };

  return (
    <div className="bg-[#F8F9FA] border border-[#E9ECEF] rounded-2xl p-5 flex gap-5 max-w-4xl w-full shadow-xs">
      
      {/* 왼쪽 영역: 미니 지도 */}
      <div className="w-1/2 h-[260px] relative rounded-xl overflow-hidden border border-[#DEE2E6]">
        <div ref={mapContainerRef} className="w-full h-full bg-[#E8F5E9]" /> 
        {/* bg-[#E8F5E9]는 지도 로딩 전 이미지와 유사한 녹색 계열 배경 대용 */}
      </div>

      {/* 오른쪽 영역: 세로 장소 리스트 */}
      <div className="w-1/2 flex flex-col gap-3 justify-center">
        {places.map((place, index) => (
          <div 
            key={index} 
            className="bg-white border border-[#E9ECEF] rounded-xl p-4 flex items-center gap-4 shadow-2xs hover:border-[#CED4DA] transition-colors"
          >
            {/* 번호 배지 */}
            <div className="w-6 h-6 rounded-full bg-[#178DD7] text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0">
              {index + 1}
            </div>
            
            {/* 장소 정보 */}
            <div className="flex flex-col">
              <span className="text-[14px] font-semibold text-[#212529] mb-0.5">
                {place.placeName}
              </span>
              <span className="text-[12px] text-[#868E96]">
                {place.visitTime} · {formatDuration(place.duration)}
              </span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default TripPreviewCard;