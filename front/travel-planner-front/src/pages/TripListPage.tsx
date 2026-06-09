import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Plus, Calendar, Coins, Users, ChevronRight, Trash2 } from 'lucide-react';

// ─────────────────────────────────────────
// 타입 정의
// ─────────────────────────────────────────
type TripStatus = 'UPCOMING' | 'COMPLETED' | 'DRAFT';
type FilterType = 'ALL' | TripStatus;

interface Trip {
  id: number;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  days: number;
  budget: number;
  companions: number;
  status: TripStatus;
  travelStyle: string;
  createdAt: string;
}

// ─────────────────────────────────────────
// 더미 데이터
// ─────────────────────────────────────────
const DUMMY_TRIPS: Trip[] = [
  {
    id: 1,
    title: '제주도 힐링 여행',
    destination: '제주도',
    startDate: '2024-08-15',
    endDate: '2024-08-18',
    days: 4,
    budget: 500000,
    companions: 2,
    status: 'UPCOMING',
    travelStyle: '여유로운',
    createdAt: '2024-07-20',
  },
  {
    id: 2,
    title: '부산 맛집 투어',
    destination: '부산',
    startDate: '2024-07-01',
    endDate: '2024-07-03',
    days: 3,
    budget: 300000,
    companions: 3,
    status: 'COMPLETED',
    travelStyle: '맛집탐방',
    createdAt: '2024-06-15',
  },
  {
    id: 3,
    title: '강릉 바다 여행',
    destination: '강릉',
    startDate: '2024-09-20',
    endDate: '2024-09-22',
    days: 3,
    budget: 250000,
    companions: 1,
    status: 'DRAFT',
    travelStyle: '자연힐링',
    createdAt: '2024-07-25',
  },
  {
    id: 4,
    title: '경주 문화 탐방',
    destination: '경주',
    startDate: '2024-06-10',
    endDate: '2024-06-12',
    days: 3,
    budget: 200000,
    companions: 2,
    status: 'COMPLETED',
    travelStyle: '문화탐방',
    createdAt: '2024-05-30',
  },
];

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
    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${className}`}>
      {label}
    </span>
  );
};

// ─────────────────────────────────────────
// 컴포넌트
// ─────────────────────────────────────────
const TripListPage: React.FC = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<FilterType>('ALL');
  const [trips, setTrips] = useState<Trip[]>(DUMMY_TRIPS);

  const FILTERS: { value: FilterType; label: string }[] = [
    { value: 'ALL', label: '전체' },
    { value: 'UPCOMING', label: '예정' },
    { value: 'COMPLETED', label: '완료' },
    { value: 'DRAFT', label: '임시저장' },
  ];

  const filtered = filter === 'ALL' ? trips : trips.filter((t) => t.status === filter);

  const handleDelete = (e: React.MouseEvent, tripId: number): void => {
    e.stopPropagation();
    if (!confirm('이 여행을 삭제할까요?')) return;
    // 💡 추후 백엔드 삭제 API 연동할 공간
    setTrips((prev) => prev.filter((t) => t.id !== tripId));
  };

  return (
    <div className="bg-[#f8f9fa] min-h-screen font-sans antialiased text-[#212529]">

      {/* 네비게이션 */}
      <nav className="bg-white border-b border-[#e9ecef] px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-7 h-7 rounded-md bg-[#178DD7] flex items-center justify-center">
            <MapPin className="text-white w-3.5 h-3.5" />
          </div>
          <span className="text-[14px] font-medium">AI 여행 플래너</span>
        </div>
        <button
          onClick={() => navigate('/planner')}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-[#178DD7] text-white text-[13px] font-medium hover:bg-[#1278ba] transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          새 여행
        </button>
      </nav>

      <div className="max-w-[720px] mx-auto px-5 py-8">

        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-medium text-[#212529]">내 여행 목록</h1>
            <p className="text-[13px] text-[#6c757d] mt-0.5">총 {trips.length}개의 여행 계획</p>
          </div>
        </div>

        {/* 필터 탭 */}
        <div className="flex gap-2 mb-5">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-1.5 rounded-full text-[13px] font-medium transition-colors
                ${filter === f.value
                  ? 'bg-[#178DD7] text-white'
                  : 'bg-white border border-[#dee2e6] text-[#6c757d] hover:bg-gray-50'}`}
            >
              {f.label}
              {f.value !== 'ALL' && (
                <span className="ml-1.5 text-[11px] opacity-70">
                  {trips.filter((t) => t.status === f.value).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* 여행 카드 목록 */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#adb5bd]">
            <MapPin className="w-12 h-12 mb-3 opacity-20" />
            <p className="text-[14px] mb-4">아직 여행 계획이 없어요</p>
            <button
              onClick={() => navigate('/planner')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#178DD7] text-white text-[13px] font-medium hover:bg-[#1278ba] transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              첫 여행 만들기
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((trip) => (
              <div
                key={trip.id}
                onClick={() => navigate(`/trips/${trip.id}`)}
                className="bg-white border border-[#e9ecef] rounded-xl p-5 cursor-pointer hover:border-[#ced4da] hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* 상단: 제목 + 뱃지 */}
                    <div className="flex items-center gap-2 mb-1.5">
                      <StatusBadge status={trip.status} />
                      <span className="text-[11px] text-[#adb5bd]">{trip.travelStyle}</span>
                    </div>
                    <h2 className="text-[16px] font-medium text-[#212529] mb-1">{trip.title}</h2>

                    {/* 목적지 */}
                    <div className="flex items-center gap-1 mb-3">
                      <MapPin className="w-3.5 h-3.5 text-[#178DD7]" />
                      <span className="text-[13px] text-[#495057]">{trip.destination}</span>
                    </div>

                    {/* 정보 뱃지들 */}
                    <div className="flex flex-wrap gap-3">
                      <div className="flex items-center gap-1.5 text-[12px] text-[#6c757d]">
                        <Calendar className="w-3.5 h-3.5" />
                        {trip.startDate} ~ {trip.endDate} ({trip.days}일)
                      </div>
                      <div className="flex items-center gap-1.5 text-[12px] text-[#6c757d]">
                        <Coins className="w-3.5 h-3.5" />
                        {trip.budget.toLocaleString()}원
                      </div>
                      <div className="flex items-center gap-1.5 text-[12px] text-[#6c757d]">
                        <Users className="w-3.5 h-3.5" />
                        {trip.companions}명
                      </div>
                    </div>
                  </div>

                  {/* 우측 버튼 */}
                  <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                    <button
                      onClick={(e) => handleDelete(e, trip.id)}
                      className="w-8 h-8 flex items-center justify-center text-[#adb5bd] hover:text-red-400 hover:bg-red-50 rounded-md transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <ChevronRight className="w-5 h-5 text-[#ced4da]" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TripListPage;