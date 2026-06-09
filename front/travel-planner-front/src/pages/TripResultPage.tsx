import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin, ChevronLeft, Wand2, Save, Clock,
  Coins, ChevronDown, ChevronUp, Check
} from 'lucide-react';

// ─────────────────────────────────────────
// 타입 정의
// ─────────────────────────────────────────
interface AiPlace {
  id: number;
  order: number;
  placeName: string;
  placeCategory: string;
  visitTime: string;
  duration: number;
  estimatedCost: number;
  description: string;
}

interface AiDaySchedule {
  dayNumber: number;
  theme: string;
  places: AiPlace[];
}

interface AiPlanResult {
  title: string;
  summary: string;
  destination: string;
  days: number;
  totalEstimatedCost: number;
  schedules: AiDaySchedule[];
}

// ─────────────────────────────────────────
// 임시 더미 데이터 (백엔드 연동 전)
// ─────────────────────────────────────────
const DUMMY_RESULT: AiPlanResult = {
  title: '제주도 힐링 여행',
  summary: 'AI가 생성한 제주도 3박4일 여유로운 힐링 코스입니다. 자연경관과 맛집을 중심으로 구성했어요.',
  destination: '제주도',
  days: 4,
  totalEstimatedCost: 420000,
  schedules: [
    {
      dayNumber: 1,
      theme: '동부 자연 탐방',
      places: [
        { id: 1, order: 1, placeName: '성산일출봉', placeCategory: '관광명소', visitTime: '09:00', duration: 120, estimatedCost: 5000, description: '유네스코 세계자연유산으로 제주 여행의 필수 코스예요.' },
        { id: 2, order: 2, placeName: '섭지코지', placeCategory: '관광명소', visitTime: '11:30', duration: 60, estimatedCost: 0, description: '드라마 올인 촬영지로 유명한 아름다운 해안 절경이에요.' },
        { id: 3, order: 3, placeName: '흑돼지거리', placeCategory: '음식점', visitTime: '13:00', duration: 60, estimatedCost: 20000, description: '제주 대표 음식 흑돼지구이를 맛볼 수 있어요.' },
        { id: 4, order: 4, placeName: '우도', placeCategory: '관광명소', visitTime: '15:00', duration: 180, estimatedCost: 15000, description: '제주에서 배로 15분 거리의 아름다운 작은 섬이에요.' },
      ],
    },
    {
      dayNumber: 2,
      theme: '서부 문화 & 카페 투어',
      places: [
        { id: 5, order: 1, placeName: '한림공원', placeCategory: '관광명소', visitTime: '10:00', duration: 90, estimatedCost: 12000, description: '아열대 식물과 용암동굴을 함께 볼 수 있는 공원이에요.' },
        { id: 6, order: 2, placeName: '협재해수욕장', placeCategory: '해변', visitTime: '12:00', duration: 120, estimatedCost: 0, description: '에메랄드빛 바다와 하얀 모래사장이 아름다운 해수욕장이에요.' },
        { id: 7, order: 3, placeName: '카페 드 몽', placeCategory: '카페', visitTime: '15:00', duration: 60, estimatedCost: 8000, description: '오션뷰를 즐길 수 있는 분위기 좋은 카페예요.' },
      ],
    },
    {
      dayNumber: 3,
      theme: '한라산 & 시내 탐방',
      places: [
        { id: 8, order: 1, placeName: '한라산 어리목 코스', placeCategory: '자연', visitTime: '08:00', duration: 240, estimatedCost: 0, description: '제주의 상징 한라산 트레킹 코스예요.' },
        { id: 9, order: 2, placeName: '제주 동문시장', placeCategory: '시장', visitTime: '14:00', duration: 90, estimatedCost: 15000, description: '제주 먹거리와 기념품을 한 곳에서 만날 수 있어요.' },
      ],
    },
    {
      dayNumber: 4,
      theme: '남부 & 출발',
      places: [
        { id: 10, order: 1, placeName: '주상절리', placeCategory: '관광명소', visitTime: '09:00', duration: 60, estimatedCost: 2000, description: '화산 용암이 만들어낸 신비로운 육각형 돌기둥이에요.' },
        { id: 11, order: 2, placeName: '중문 관광단지', placeCategory: '관광명소', visitTime: '11:00', duration: 90, estimatedCost: 0, description: '쇼핑과 관광을 함께 즐길 수 있는 복합 단지예요.' },
      ],
    },
  ],
};

// ─────────────────────────────────────────
// 컴포넌트
// ─────────────────────────────────────────
const TripResultPage: React.FC = () => {
  const navigate = useNavigate();

  // 💡 추후 useLocation 또는 API로 실제 데이터 교체
  const result = DUMMY_RESULT;

  const [openDays, setOpenDays] = useState<number[]>([1]);
  const [isSaving, setIsSaving] = useState(false);

  const toggleDay = (day: number): void => {
    setOpenDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSave = async (): Promise<void> => {
    setIsSaving(true);
    try {
      // 💡 추후 백엔드 저장 API 연동할 공간
      // await saveTrip(result);
      console.log('일정 저장:', result);
      setTimeout(() => {
        setIsSaving(false);
        navigate('/trips');
      }, 1000);
    } catch {
      setIsSaving(false);
      alert('저장에 실패했어요. 다시 시도해주세요.');
    }
  };

  const handleRegenerate = (): void => {
    // 💡 추후 AI 재생성 API 연동할 공간
    navigate('/planner');
  };

  return (
    <div className="bg-[#f8f9fa] min-h-screen font-sans antialiased text-[#212529]">

      {/* 네비게이션 */}
      <nav className="bg-white border-b border-[#e9ecef] px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/planner')}
            className="flex items-center gap-1 text-[13px] text-[#6c757d] hover:text-[#212529] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            다시 입력
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-[#178DD7] flex items-center justify-center">
              <MapPin className="text-white w-3.5 h-3.5" />
            </div>
            <span className="text-[14px] font-medium">AI 여행 플래너</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRegenerate}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[#dee2e6] text-[13px] text-[#495057] hover:bg-gray-50 transition-colors"
          >
            <Wand2 className="w-3.5 h-3.5" />
            재생성
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-[13px] font-medium text-white transition-colors
              ${isSaving ? 'bg-[#7ec2ed] cursor-not-allowed' : 'bg-[#178DD7] hover:bg-[#1278ba] cursor-pointer'}`}
          >
            {isSaving ? (
              <>
                <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                저장 중...
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                일정 저장
              </>
            )}
          </button>
        </div>
      </nav>

      <div className="max-w-[640px] mx-auto px-5 py-8">

        {/* 상단 요약 카드 */}
        <div className="bg-white border border-[#e9ecef] rounded-xl p-5 mb-5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#E6F1FB] text-[#178DD7] text-xs font-medium mb-3">
            <Wand2 className="w-3 h-3" />
            AI 생성 완료
          </div>
          <h1 className="text-xl font-medium text-[#212529] mb-1">{result.title}</h1>
          <p className="text-[13px] text-[#6c757d] leading-relaxed mb-4">{result.summary}</p>
          <div className="flex gap-4 pt-3 border-t border-[#f1f3f5]">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#178DD7]" />
              <span className="text-[13px] text-[#495057]">{result.destination}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#178DD7]" />
              <span className="text-[13px] text-[#495057]">{result.days}일</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5 text-[#178DD7]" />
              <span className="text-[13px] text-[#495057]">
                예상 {result.totalEstimatedCost.toLocaleString()}원
              </span>
            </div>
          </div>
        </div>

        {/* 날짜별 일정 */}
        <div className="flex flex-col gap-3">
          {result.schedules.map((day) => (
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
                        <div className="w-6 h-6 rounded-full bg-[#E6F1FB] text-[#178DD7] text-xs font-medium flex items-center justify-center">
                          {place.order}
                        </div>
                        {place.order < day.places.length && (
                          <div className="w-[1px] h-6 bg-[#dee2e6]"></div>
                        )}
                      </div>
                      <div className="flex-1 pb-1">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-[14px] font-medium text-[#212529]">{place.placeName}</span>
                          <span className="text-xs text-[#adb5bd]">{place.placeCategory}</span>
                        </div>
                        <p className="text-[12px] text-[#6c757d] leading-relaxed mb-2">{place.description}</p>
                        <div className="flex gap-3">
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
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 하단 버튼 */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleRegenerate}
            className="flex-1 py-3 rounded-xl border border-[#dee2e6] text-[13px] font-medium text-[#495057] hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <Wand2 className="w-4 h-4" />
            다시 생성하기
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`flex-1 py-3 rounded-xl text-[13px] font-medium text-white transition-colors flex items-center justify-center gap-2
              ${isSaving ? 'bg-[#7ec2ed] cursor-not-allowed' : 'bg-[#178DD7] hover:bg-[#1278ba] cursor-pointer'}`}
          >
            <Check className="w-4 h-4" />
            이 일정으로 저장하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default TripResultPage;