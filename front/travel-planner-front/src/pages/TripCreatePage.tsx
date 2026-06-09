import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Wand2, Calendar, Wallet, Users, ChevronLeft } from 'lucide-react';

type TravelStyle = 'RELAXED' | 'ACTIVE' | 'CULTURAL' | 'FOOD' | 'NATURE';

interface TripForm {
  destination: string;
  startDate: string;
  endDate: string;
  budget: string;
  travelStyle: TravelStyle | '';
  companions: number;
  preferences: string;
}

interface StyleOption {
  value: TravelStyle;
  label: string;
  emoji: string;
  desc: string;
}

const STYLE_OPTIONS: StyleOption[] = [
  { value: 'RELAXED', label: '여유로운', emoji: '🌿', desc: '힐링 & 휴식 위주' },
  { value: 'ACTIVE', label: '액티브', emoji: '🏃', desc: '스포츠 & 활동 위주' },
  { value: 'CULTURAL', label: '문화탐방', emoji: '🏛️', desc: '역사 & 문화 위주' },
  { value: 'FOOD', label: '맛집탐방', emoji: '🍜', desc: '음식 & 카페 위주' },
  { value: 'NATURE', label: '자연힐링', emoji: '🏔️', desc: '자연 & 경치 위주' },
];

const TripCreatePage: React.FC = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState<TripForm>({
    destination: '',
    startDate: '',
    endDate: '',
    budget: '',
    travelStyle: '',
    companions: 1,
    preferences: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const calcDays = (): number => {
    if (!form.startDate || !form.endDate) return 0;
    const diff =
      new Date(form.endDate).getTime() - new Date(form.startDate).getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
  };

  const validate = (): boolean => {
    if (!form.destination.trim()) {
      setError('목적지를 입력해주세요.');
      return false;
    }
    if (!form.startDate || !form.endDate) {
      setError('여행 날짜를 선택해주세요.');
      return false;
    }
    if (new Date(form.endDate) < new Date(form.startDate)) {
      setError('종료일이 시작일보다 빠를 수 없어요.');
      return false;
    }
    if (!form.budget || Number(form.budget) <= 0) {
      setError('예산을 입력해주세요.');
      return false;
    }
    if (!form.travelStyle) {
      setError('여행 스타일을 선택해주세요.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      // 💡 추후 백엔드 AI 일정 생성 API 연동할 공간
      // const response = await createTripWithAI({
      //   destination: form.destination,
      //   days: calcDays(),
      //   budget: Number(form.budget),
      //   travelStyle: form.travelStyle as TravelStyle,
      //   companions: form.companions,
      //   preferences: form.preferences,
      // });
      // navigate(`/trips/${response.data.data.id}`);

      console.log('여행 생성 요청:', form);
      setTimeout(() => {
        setIsLoading(false);
        navigate('/trips/result'); // 💡 AI 결과 페이지로 이동
      }, 1500);
    } catch (err) {
      setIsLoading(false);
      setError('일정 생성에 실패했어요. 다시 시도해주세요.');
    }
  };

  return (
    <div className="bg-[#f8f9fa] min-h-screen font-sans antialiased text-[#212529]">

      {/* 네비게이션 */}
      <nav className="bg-white border-b border-[#e9ecef] px-6 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1 text-[13px] text-[#6c757d] hover:text-[#212529] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          돌아가기
        </button>
        <div className="flex items-center gap-2 ml-2">
          <div className="w-7 h-7 rounded-md bg-[#178DD7] flex items-center justify-center">
            <MapPin className="text-white w-3.5 h-3.5" />
          </div>
          <span className="text-[14px] font-medium">AI 여행 플래너</span>
        </div>
      </nav>

      {/* 메인 컨텐츠 */}
      <div className="max-w-[560px] mx-auto px-5 py-10">

        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E6F1FB] text-[#178DD7] text-xs font-medium mb-3">
            <Wand2 className="w-3.5 h-3.5" />
            AI 일정 자동 생성
          </div>
          <h1 className="text-2xl font-medium text-[#212529] mb-2">
            어떤 여행을 원하시나요?
          </h1>
          <p className="text-[13px] text-[#6c757d]">
            정보를 입력하면 AI가 최적의 일정을 만들어드려요
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">

          {/* 목적지 */}
          <div className="bg-white border border-[#e9ecef] rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-[#178DD7]" />
              <span className="text-[14px] font-medium">목적지</span>
            </div>
            <input
              className="w-full py-2.5 px-3 border border-[#dee2e6] rounded-md text-sm bg-white focus:outline-none focus:border-[#178DD7] transition-colors"
              type="text"
              name="destination"
              placeholder="예) 제주도, 부산, 도쿄"
              value={form.destination}
              onChange={handleChange}
            />
          </div>

          {/* 여행 날짜 */}
          <div className="bg-white border border-[#e9ecef] rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-[#178DD7]" />
              <span className="text-[14px] font-medium">여행 날짜</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-[#6c757d] mb-1 block">시작일</label>
                <input
                  className="w-full py-2.5 px-3 border border-[#dee2e6] rounded-md text-sm bg-white focus:outline-none focus:border-[#178DD7] transition-colors"
                  type="date"
                  name="startDate"
                  value={form.startDate}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="text-xs text-[#6c757d] mb-1 block">종료일</label>
                <input
                  className="w-full py-2.5 px-3 border border-[#dee2e6] rounded-md text-sm bg-white focus:outline-none focus:border-[#178DD7] transition-colors"
                  type="date"
                  name="endDate"
                  value={form.endDate}
                  onChange={handleChange}
                />
              </div>
            </div>
            {calcDays() > 0 && (
              <div className="mt-2.5 text-xs text-[#178DD7] font-medium">
                총 {calcDays()}일 여행
              </div>
            )}
          </div>

          {/* 예산 & 인원 */}
          <div className="bg-white border border-[#e9ecef] rounded-xl p-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Wallet className="w-4 h-4 text-[#178DD7]" />
                  <span className="text-[14px] font-medium">예산</span>
                </div>
                <div className="relative">
                  <input
                    className="w-full py-2.5 pl-3 pr-8 border border-[#dee2e6] rounded-md text-sm bg-white focus:outline-none focus:border-[#178DD7] transition-colors"
                    type="number"
                    name="budget"
                    placeholder="500000"
                    value={form.budget}
                    onChange={handleChange}
                    min={0}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#adb5bd]">원</span>
                </div>
                {form.budget && (
                  <div className="mt-1.5 text-xs text-[#6c757d]">
                    {Number(form.budget).toLocaleString()}원
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-4 h-4 text-[#178DD7]" />
                  <span className="text-[14px] font-medium">인원</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, companions: Math.max(1, prev.companions - 1) }))}
                    className="w-8 h-8 rounded-md border border-[#dee2e6] text-[#6c757d] flex items-center justify-center hover:bg-gray-50 transition-colors text-lg"
                  >
                    −
                  </button>
                  <span className="text-sm font-medium w-6 text-center">{form.companions}</span>
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, companions: Math.min(10, prev.companions + 1) }))}
                    className="w-8 h-8 rounded-md border border-[#dee2e6] text-[#6c757d] flex items-center justify-center hover:bg-gray-50 transition-colors text-lg"
                  >
                    +
                  </button>
                  <span className="text-xs text-[#6c757d]">명</span>
                </div>
              </div>
            </div>
          </div>

          {/* 여행 스타일 */}
          <div className="bg-white border border-[#e9ecef] rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[14px] font-medium">여행 스타일</span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {STYLE_OPTIONS.map((style) => (
                <button
                  key={style.value}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, travelStyle: style.value }))}
                  className={`flex flex-col items-center gap-1 py-3 px-1 rounded-lg border text-center transition-colors
                    ${form.travelStyle === style.value
                      ? 'border-[#178DD7] bg-[#E6F1FB]'
                      : 'border-[#dee2e6] bg-white hover:bg-gray-50'
                    }`}
                >
                  <span className="text-xl">{style.emoji}</span>
                  <span className="text-[11px] font-medium text-[#212529]">{style.label}</span>
                  <span className="text-[10px] text-[#6c757d] leading-tight">{style.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 추가 요청사항 */}
          <div className="bg-white border border-[#e9ecef] rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[14px] font-medium">추가 요청사항</span>
              <span className="text-xs text-[#adb5bd]">선택사항</span>
            </div>
            <textarea
              className="w-full py-2.5 px-3 border border-[#dee2e6] rounded-md text-sm bg-white focus:outline-none focus:border-[#178DD7] transition-colors resize-none"
              name="preferences"
              rows={3}
              placeholder="예) 걷기 싫어요, 아이 동반이라 안전한 곳 위주로, 해산물 알레르기 있어요"
              value={form.preferences}
              onChange={handleChange}
            />
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="text-sm text-red-500 text-center bg-red-50 border border-red-100 rounded-md py-2.5 px-4">
              {error}
            </div>
          )}

          {/* 제출 버튼 */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 rounded-xl text-sm font-medium text-white transition-colors flex items-center justify-center gap-2
              ${isLoading ? 'bg-[#7ec2ed] cursor-not-allowed' : 'bg-[#178DD7] hover:bg-[#1278ba] cursor-pointer'}`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                AI가 일정을 생성하고 있어요...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                AI로 일정 생성하기
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TripCreatePage;