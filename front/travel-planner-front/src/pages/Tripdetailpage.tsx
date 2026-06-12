import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  MapPin, Calendar, Coins, Users, ChevronLeft,
  Edit2, Trash2, Clock, ChevronDown, ChevronUp, Navigation
} from 'lucide-react';
import { getTripById, deleteTrip, type TripResponse } from '../service/tripService';

type TripStatus = 'UPCOMING' | 'COMPLETED' | 'DRAFT';

const StatusBadge: React.FC<{ status: TripStatus }> = ({ status }) => {
  const map = {
    UPCOMING: { label: '예정', className: 'bg-[#E6F1FB] text-[#178DD7]' },
    COMPLETED: { label: '완료', className: 'bg-[#EAF3DE] text-[#639922]' },
    DRAFT: { label: '임시저장', className: 'bg-[#f1f3f5] text-[#6c757d]' },
  };
  const { label, className } = map[status] ?? map['DRAFT'];
  return (
    <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${className}`}>
      {label}
    </span>
  );
};

const TripDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [trip, setTrip] = useState<TripResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDays, setOpenDays] = useState<number[]>([1]);

  useEffect(() => {
    const fetchTrip = async () => {
      if (!id) return;
      try {
        const data = await getTripById(Number(id));
        setTrip(data);
      } catch (err: any) {
        setError('여행 정보를 불러오지 못했어요.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTrip();
  }, [id]);

  const toggleDay = (day: number): void => {
    setOpenDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleDelete = async (): Promise<void> => {
    if (!confirm('이 여행을 삭제할까요?')) return;
    try {
      await deleteTrip(Number(id));
      navigate('/trips');
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
          <span className="text-[13px]">여행 정보를 불러오는 중...</span>
        </div>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="bg-[#f8f9fa] min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-[#6c757d]">
          <p className="text-[14px]">{error || '여행을 찾을 수 없어요.'}</p>
          <button onClick={() => navigate('/trips')} className="text-[#178DD7] text-[13px]">
            목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

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
            onClick={() => navigate(`/trips/${trip.tripId}/planner`)}
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
                <StatusBadge status={trip.status as TripStatus} />
                <span className="text-[11px] text-[#adb5bd]">{trip.travelStyle}</span>
              </div>
              <h1 className="text-xl font-medium text-[#212529]">{trip.title}</h1>
            </div>
          </div>

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

          <div className="mt-3 pt-3 border-t border-[#f1f3f5] flex items-center justify-between">
            <span className="text-[12px] text-[#6c757d]">총 예상 비용</span>
            <div className="flex items-center gap-2">
              <span className="text-[14px] font-medium text-[#212529]">
                {totalCost.toLocaleString()}원
              </span>
              <span className="text-[11px] text-[#adb5bd]">/ {trip.budget.toLocaleString()}원</span>
            </div>
          </div>

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
                    <span className="text-[14px] font-medium text-[#212529]">{day.dayNumber}일차</span>
                    <span className="text-[12px] text-[#6c757d] ml-2">{day.theme}</span>
                    <div className="text-[11px] text-[#adb5bd]">{day.scheduleDate}</div>
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

              {openDays.includes(day.dayNumber) && (
                <div className="border-t border-[#f1f3f5] divide-y divide-[#f1f3f5]">
                  {day.places.map((place) => (
                    <div key={place.placeId} className="flex gap-3 px-5 py-3.5">
                      <div className="flex flex-col items-center gap-1 flex-shrink-0">
                        <div className="w-5 h-5 rounded-full bg-[#E6F1FB] text-[#178DD7] text-[10px] font-medium flex items-center justify-center">
                          {place.placeOrder}
                        </div>
                        {place.placeOrder < day.places.length && (
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

        <button
          onClick={() => navigate(`/trips/${trip.tripId}/planner`)}
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