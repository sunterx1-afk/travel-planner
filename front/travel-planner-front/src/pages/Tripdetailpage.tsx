import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  MapPin, Calendar, Coins, Users, ChevronLeft,
  Edit2, Trash2, Clock, ChevronDown, ChevronUp, Navigation
} from 'lucide-react';

// ─────────────────────────────────────────
// 타입 정의
// ─────────────────────────────────────────
type TripStatus = 'UPCOMING' | 'COMPLETED' | 'DRAFT';

interface SchedulePlace {
  id: number;
  order: number;
  placeName: string;
  placeCategory: string;
  address: string;
  visitTime: string;
  duration: number;
  estimatedCost: number;
  memo: string;
}

interface DaySchedule {
  dayNumber: number;
  date: string;
  theme: string;
  places: SchedulePlace[];
}

interface TripDetail {
  id: number;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  days: number;
  budget: number;
  companions: number;
  travelStyle: string;
  status: TripStatus;
  createdAt: string;
  schedules: DaySchedule[];
}

// ─────────────────────────────────────────
// 더미 데이터
// ─────────────────────────────────────────
const DUMMY_DETAIL: TripDetail = {
  id: 1,
  title: '제주도 힐링 여행',
  destination: '제주도',
  startDate: '2024-08-15',
  endDate: '2024-08-18',
  days: 4,
  budget: 500000,
  companions: 2,
  travelStyle: '여유로운',
  status: 'UPCOMING',
  createdAt: '2024-07-20',
  schedules: [
    {
      dayNumber: 1,
      date: '2024-08-15',
      theme: '동부 자연 탐방',
      places: [
        { id: 1, order: 1, placeName: '성산일출봉', placeCategory: '관광명소', address: '제주 서귀포시 성산읍', visitTime: '09:00', duration: 120, estimatedCost: 5000, memo: '유네스코 세계자연유산' },
        { id: 2, order: 2, placeName: '섭지코지', placeCategory: '관광명소', address: '제주 서귀포시 성산읍', visitTime: '11:30', duration: 60, estimatedCost: 0, memo: '' },
        { id: 3, order: 3, placeName: '흑돼지거리', placeCategory: '음식점', address: '제주시 연동', visitTime: '13:00', duration: 60, estimatedCost: 20000, memo: '1인 2만원 예상' },
        { id: 4, order: 4, placeName: '우도', placeCategory: '관광명소', address: '제주 제주시 우도면', visitTime: '15:00', duration: 180, estimatedCost: 15000, memo: '배편 왕복 포함' },
      ],
    },
    {
      dayNumber: 2,
      date: '2024-08-16',
      theme: '서부 카페 투어',
      places: [
        { id: 5, order: 1, placeName: '한림공원', placeCategory: '관광명소', address: '제주 제주시 한림읍', visitTime: '10:00', duration: 90, estimatedCost: 12000, memo: '' },
        { id: 6, order: 2, placeName: '협재해수욕장', placeCategory: '해변', address: '제주 제주시 한림읍', visitTime: '12:00', duration: 120, estimatedCost: 0, memo: '' },
        { id: 7, order: 3, placeName: '카페 드 몽', placeCategory: '카페', address: '제주 제주시 한림읍', visitTime: '15:00', duration: 60, estimatedCost: 8000, memo: '오션뷰 카페' },
      ],
    },
    {
      dayNumber: 3,
      date: '2024-08-17',
      theme: '한라산 트레킹',
      places: [
        { id: 8, order: 1, placeName: '한라산 어리목 코스', placeCategory: '자연', address: '제주 제주시 해안동', visitTime: '08:00', duration: 240, estimatedCost: 0, memo: '등산화 필수' },
        { id: 9, order: 2, placeName: '제주 동문시장', placeCategory: '시장', address: '제주시 이도1동', visitTime: '14:00', duration: 90, estimatedCost: 15000, memo: '' },
      ],
    },
    {
      dayNumber: 4,
      date: '2024-08-18',
      theme: '남부 & 출발',
      places: [
        { id: 10, order: 1, placeName: '주상절리', placeCategory: '관광명소', address: '제주 서귀포시 중문동', visitTime: '09:00', duration: 60, estimatedCost: 2000, memo: '' },
        { id: 11, order: 2, placeName: '중문 관광단지', placeCategory: '관광명소', address: '제주 서귀포시 중문동', visitTime: '11:00', duration: 90, estimatedCost: 0, memo: '' },
      ],
    },
  ],
};

// ─────────────────────────────────────────
// 상태 뱃지
// ─────────────────────────────────────────
const StatusBadge: React.FC<{ status: TripStatus }> = ({ status }) => {
  const map = {
    UPCOMING: { label: '예정', className: 'bg-[#E6F1FB] text-[#178DD7]' },
    COMPLETED: { label: '완료', className: 'bg-[#EAF3DE] text-[#639922]' },
    DRAFT: { label: '임시저장', className: 'bg-[#f1f3f5] text-[#6c757d]' },
  };
  const { label, className } = map[status];
  return (
    <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${className}`}>
      {label}
    </span>
  );
};

// ─────────────────────────────────────────
// 컴포넌트
// ─────────────────────────────────────────
const TripDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // 💡 추후 백엔드 API로 id 기반 데이터 조회
  const trip = DUMMY_DETAIL;

  const [openDays, setOpenDays] = useState<number[]>([1]);

  const toggleDay = (day: number): void => {
    setOpenDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleDelete = (): void => {
    if (!confirm('이 여행을 삭제할까요?')) return;
    // 💡 추후 백엔드 삭제 API 연동할 공간
    console.log('여행 삭제:', id);
    navigate('/trips');
  };

  const totalCost = trip.schedules
    .flatMap((s) => s.places)
    .reduce((sum, p) => sum + p.estimatedCost, 0);

  return (
    <div className="bg-[#f8f9fa] min-h-screen font-sans antialiased text-[#212529]">

      {/* 네비게이션 */}
      <nav className="bg-white border-b border-[#e9ecef] px-6 py-3 flex items-center justify-between">
        <button
          onClick={() => navigate('/trips')}
          className="flex items-center gap-1 text-[13px] text-[#6c757d] hover:text-[#212529] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          내 여행 목록
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/trips/${trip.id}/planner`)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[#dee2e6] text-[13px] text-[#495057] hover:bg-gray-50 transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
            일정 편집
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-red-200 text-[13px] text-red-400 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            삭제
          </button>
        </div>
      </nav>

      <div className="max-w-[640px] mx-auto px-5 py-8">

        {/* 여행 요약 카드 */}
        <div className="bg-white border border-[#e9ecef] rounded-xl p-5 mb-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <StatusBadge status={trip.status} />
                <span className="text-[11px] text-[#adb5bd]">{trip.travelStyle}</span>
              </div>
              <h1 className="text-xl font-medium text-[#212529]">{trip.title}</h1>
            </div>
          </div>

          {/* 정보 그리드 */}
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#f1f3f5]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-[#E6F1FB] flex items-center justify-center flex-shrink-0">
                <MapPin className="w-3.5 h-3.5 text-[#178DD7]" />
              </div>
              <div>
                <div className="text-[11px] text-[#adb5bd]">목적지</div>
                <div className="text-[13px] font-medium">{trip.destination}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-[#E6F1FB] flex items-center justify-center flex-shrink-0">
                <Calendar className="w-3.5 h-3.5 text-[#178DD7]" />
              </div>
              <div>
                <div className="text-[11px] text-[#adb5bd]">여행 기간</div>
                <div className="text-[13px] font-medium">{trip.startDate} ~ {trip.endDate}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-[#E6F1FB] flex items-center justify-center flex-shrink-0">
                <Coins className="w-3.5 h-3.5 text-[#178DD7]" />
              </div>
              <div>
                <div className="text-[11px] text-[#adb5bd]">예산</div>
                <div className="text-[13px] font-medium">{trip.budget.toLocaleString()}원</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-[#E6F1FB] flex items-center justify-center flex-shrink-0">
                <Users className="w-3.5 h-3.5 text-[#178DD7]" />
              </div>
              <div>
                <div className="text-[11px] text-[#adb5bd]">인원</div>
                <div className="text-[13px] font-medium">{trip.companions}명</div>
              </div>
            </div>
          </div>

          {/* 예상 비용 */}
          <div className="mt-3 pt-3 border-t border-[#f1f3f5] flex items-center justify-between">
            <span className="text-[12px] text-[#6c757d]">총 예상 비용</span>
            <div className="flex items-center gap-2">
              <span className="text-[14px] font-medium text-[#212529]">
                {totalCost.toLocaleString()}원
              </span>
              <span className="text-[11px] text-[#adb5bd]">/ {trip.budget.toLocaleString()}원</span>
            </div>
          </div>

          {/* 예산 진행바 */}
          <div className="mt-2 h-1.5 bg-[#f1f3f5] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#178DD7] rounded-full transition-all"
              style={{ width: `${Math.min((totalCost / trip.budget) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* 날짜별 일정 */}
        <h2 className="text-[15px] font-medium text-[#212529] mb-3">전체 일정</h2>
        <div className="flex flex-col gap-3">
          {trip.schedules.map((day) => (
            <div key={day.dayNumber} className="bg-white border border-[#e9ecef] rounded-xl overflow-hidden">

              {/* 날짜 헤더 */}
              <button
                type="button"
                onClick={() => toggleDay(day.dayNumber)}
                className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#178DD7] text-white text-xs font-medium flex items-center justify-center flex-shrink-0">
                    {day.dayNumber}
                  </div>
                  <div className="text-left">
                    <span className="text-[14px] font-medium text-[#212529]">
                      {day.dayNumber}일차
                    </span>
                    <span className="text-[12px] text-[#6c757d] ml-2">{day.theme}</span>
                    <div className="text-[11px] text-[#adb5bd]">{day.date}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#adb5bd]">{day.places.length}개 장소</span>
                  {openDays.includes(day.dayNumber)
                    ? <ChevronUp className="w-4 h-4 text-[#adb5bd]" />
                    : <ChevronDown className="w-4 h-4 text-[#adb5bd]" />
                  }
                </div>
              </button>

              {/* 장소 목록 */}
              {openDays.includes(day.dayNumber) && (
                <div className="border-t border-[#f1f3f5] divide-y divide-[#f1f3f5]">
                  {day.places.map((place) => (
                    <div key={place.id} className="flex gap-3 px-5 py-3.5">
                      <div className="flex flex-col items-center gap-1 flex-shrink-0">
                        <div className="w-5 h-5 rounded-full bg-[#E6F1FB] text-[#178DD7] text-[10px] font-medium flex items-center justify-center">
                          {place.order}
                        </div>
                        {place.order < day.places.length && (
                          <div className="w-[1px] h-5 bg-[#dee2e6]" />
                        )}
                      </div>
                      <div className="flex-1 pb-1">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-[14px] font-medium text-[#212529]">{place.placeName}</span>
                          <span className="text-[11px] text-[#adb5bd]">{place.placeCategory}</span>
                        </div>
                        <div className="text-[12px] text-[#6c757d] mb-1.5 flex items-center gap-1">
                          <Navigation className="w-3 h-3" />
                          {place.address}
                        </div>
                        <div className="flex gap-3 mb-1">
                          <span className="flex items-center gap-1 text-[11px] text-[#6c757d]">
                            <Clock className="w-3 h-3" />
                            {place.visitTime} · {place.duration}분
                          </span>
                          <span className="flex items-center gap-1 text-[11px] text-[#6c757d]">
                            <Coins className="w-3 h-3" />
                            {place.estimatedCost === 0 ? '무료' : `${place.estimatedCost.toLocaleString()}원`}
                          </span>
                        </div>
                        {place.memo && (
                          <div className="text-[11px] text-[#6c757d] bg-[#f8f9fa] px-2 py-1 rounded-md">
                            💬 {place.memo}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 하단 편집 버튼 */}
        <button
          onClick={() => navigate(`/trips/${trip.id}/planner`)}
          className="w-full mt-6 py-3 rounded-xl bg-[#178DD7] text-white text-[13px] font-medium hover:bg-[#1278ba] transition-colors flex items-center justify-center gap-2"
        >
          <Edit2 className="w-4 h-4" />
          일정 편집하기
        </button>
      </div>
    </div>
  );
};

export default TripDetailPage;