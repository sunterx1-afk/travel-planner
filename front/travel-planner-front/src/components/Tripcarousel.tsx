import React, { useEffect, useState, useCallback } from 'react';
import TripPreviewCard from './TripPreviewCard';
import axios from 'axios';
import api from '../service/axios';

interface PlaceResponse {
  placeId: number;
  placeOrder: number;
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

interface DayScheduleResponse {
  dayId: number;
  dayNumber: number;
  scheduleDate: string;
  theme: string;
  places: PlaceResponse[];
}

interface TripResponse {
  tripId: number;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  days: number;
  budget: number;
  travelStyle: string;
  companions: number;
  status: string;
  createdAt: string;
  schedules: DayScheduleResponse[];
}

const TripCarousel: React.FC = () => {
  const [trips, setTrips] = useState<TripResponse[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const res = await api.get<TripResponse[]>('/api/trips');
        // Day1 장소가 있는 여행만 필터링
        const validTrips = res.data.filter(
          (trip) => trip.schedules?.some((s) => s.dayNumber === 1 && s.places?.length > 0)
        );
        setTrips(validTrips);
      } catch (e) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, []);

  const prev = useCallback(() => {
    setCurrentIndex((i) => (i === 0 ? trips.length - 1 : i - 1));
  }, [trips.length]);

  const next = useCallback(() => {
    setCurrentIndex((i) => (i === trips.length - 1 ? 0 : i + 1));
  }, [trips.length]);

  // 키보드 방향키 지원
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [prev, next]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[320px] text-[#ADB5BD] text-sm">
        일정을 불러오는 중...
      </div>
    );
  }

  if (error || trips.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[320px] text-[#ADB5BD] text-sm gap-2">
        <span>아직 생성된 여행 일정이 없어요</span>
        <span className="text-xs">AI로 첫 번째 여행을 만들어보세요 ✈️</span>
      </div>
    );
  }

  const currentTrip = trips[currentIndex];

  // Day 1 장소만 추출
  const day1 = currentTrip.schedules.find((s) => s.dayNumber === 1);
  const previewPlaces = (day1?.places ?? [])
    .sort((a, b) => a.placeOrder - b.placeOrder)
    .map((p) => ({
      placeName: p.placeName,
      latitude: p.latitude,
      longitude: p.longitude,
      visitTime: p.visitTime,
      duration: p.duration,
    }));

  return (
    <div className="flex flex-col items-center gap-4 w-full">

      {/* 여행 제목 + 목적지 */}
      <div className="text-center">
        <h3 className="text-[16px] font-bold text-[#212529]">{currentTrip.title}</h3>
        <p className="text-[13px] text-[#868E96] mt-0.5">
          {currentTrip.destination} · {currentTrip.days}일 · Day 1 미리보기
        </p>
      </div>

      {/* 카드 + 좌우 화살표 */}
      <div className="flex items-center gap-3 w-full max-w-4xl">

        {/* 이전 버튼 */}
        <button
          onClick={prev}
          disabled={trips.length <= 1}
          className="w-9 h-9 flex-shrink-0 rounded-full border border-[#DEE2E6] bg-white text-[#495057] flex items-center justify-center hover:bg-[#F1F3F5] transition-colors disabled:opacity-30 disabled:cursor-not-allowed shadow-xs"
          aria-label="이전 일정"
        >
          ‹
        </button>

        {/* 카드 */}
        <div className="flex-1 min-w-0">
          <TripPreviewCard
            tripId={currentTrip.tripId}
            title={currentTrip.title}
            places={previewPlaces}
          />
        </div>

        {/* 다음 버튼 */}
        <button
          onClick={next}
          disabled={trips.length <= 1}
          className="w-9 h-9 flex-shrink-0 rounded-full border border-[#DEE2E6] bg-white text-[#495057] flex items-center justify-center hover:bg-[#F1F3F5] transition-colors disabled:opacity-30 disabled:cursor-not-allowed shadow-xs"
          aria-label="다음 일정"
        >
          ›
        </button>

      </div>

      {/* 도트 인디케이터 */}
      {trips.length > 1 && (
        <div className="flex gap-1.5">
          {trips.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`rounded-full transition-all ${
                i === currentIndex
                  ? 'w-5 h-2 bg-[#178DD7]'
                  : 'w-2 h-2 bg-[#DEE2E6] hover:bg-[#ADB5BD]'
              }`}
              aria-label={`${i + 1}번째 일정`}
            />
          ))}
        </div>
      )}

    </div>
  );
};

export default TripCarousel;