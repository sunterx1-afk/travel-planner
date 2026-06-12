import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Plus, Calendar, Coins, Users, ChevronRight, Trash2 } from 'lucide-react';
import { getMyTrips, deleteTrip, type TripResponse } from '../service/tripService';

type TripStatus = 'UPCOMING' | 'COMPLETED' | 'DRAFT';
type FilterType = 'ALL' | TripStatus;

const StatusBadge: React.FC<{ status: TripStatus }> = ({ status }) => {
  const map = {
    UPCOMING: { label: '예정', className: 'bg-[#E6F1FB] text-[#178DD7]' },
    COMPLETED: { label: '완료', className: 'bg-[#EAF3DE] text-[#639922]' },
    DRAFT: { label: '임시저장', className: 'bg-[#f1f3f5] text-[#6c757d]' },
  };
  const { label, className } = map[status] ?? map['DRAFT'];
  return (
    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${className}`}>
      {label}
    </span>
  );
};

const TripListPage: React.FC = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<FilterType>('ALL');
  const [trips, setTrips] = useState<TripResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const FILTERS: { value: FilterType; label: string }[] = [
    { value: 'ALL', label: '전체' },
    { value: 'UPCOMING', label: '예정' },
    { value: 'COMPLETED', label: '완료' },
    { value: 'DRAFT', label: '임시저장' },
  ];

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const data = await getMyTrips();
        setTrips(data);
      } catch (err: any) {
        setError('여행 목록을 불러오지 못했어요.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTrips();
  }, []);

  const filtered = filter === 'ALL'
    ? trips
    : trips.filter((t) => t.status === filter);

  const handleDelete = async (e: React.MouseEvent, tripId: number): Promise<void> => {
    e.stopPropagation();
    if (!confirm('이 여행을 삭제할까요?')) return;
    try {
      await deleteTrip(tripId);
      setTrips((prev) => prev.filter((t) => t.tripId !== tripId));
    } catch (err) {
      alert('삭제에 실패했어요. 다시 시도해주세요.');
    }
  };

  if (isLoading) {
    return (
      <div className="bg-[#f8f9fa] min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-[#6c757d]">
          <svg className="animate-spin w-8 h-8 text-[#178DD7]" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <span className="text-[13px]">여행 목록을 불러오는 중...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f8f9fa] min-h-screen font-sans antialiased text-[#212529]">
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-medium text-[#212529]">내 여행 목록</h1>
            <p className="text-[13px] text-[#6c757d] mt-0.5">총 {trips.length}개의 여행 계획</p>
          </div>
        </div>

        {error && (
          <div className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-md py-2.5 px-4 mb-4">
            {error}
          </div>
        )}

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
                key={trip.tripId}
                onClick={() => navigate(`/trips/${trip.tripId}`)}
                className="bg-white border border-[#e9ecef] rounded-xl p-5 cursor-pointer hover:border-[#ced4da] hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <StatusBadge status={trip.status as TripStatus} />
                      <span className="text-[11px] text-[#adb5bd]">{trip.travelStyle}</span>
                    </div>
                    <h2 className="text-[16px] font-medium text-[#212529] mb-1">{trip.title}</h2>
                    <div className="flex items-center gap-1 mb-3">
                      <MapPin className="w-3.5 h-3.5 text-[#178DD7]" />
                      <span className="text-[13px] text-[#495057]">{trip.destination}</span>
                    </div>
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
                  <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                    <button
                      onClick={(e) => handleDelete(e, trip.tripId)}
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