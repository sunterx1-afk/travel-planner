import React from 'react';
import { MapPin, Sparkles, Wand2, Play, Map, Coins } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import TripCarousel from '../components/Tripcarousel';
import TripPreviewCard from '../components/TripPreviewCard';

// 비로그인용 샘플 데이터 (제주도)
const SAMPLE_PREVIEW_PLACES = [
  { placeName: '성산일출봉', latitude: 33.45853, longitude: 126.94234, visitTime: '09:00', duration: 120 },
  { placeName: '섭지코지',   latitude: 33.42443, longitude: 126.93121, visitTime: '11:30', duration: 60  },
  { placeName: '흑돼지거리', latitude: 33.51651, longitude: 126.52732, visitTime: '13:00', duration: 60  },
];

const MainLandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logoutState } = useAuth();

  const handleStart = () => { navigate('/planner'); };

  return (
    <div className="bg-[#f8f9fa] min-h-screen font-sans antialiased text-[#212529]">

      {/* 1. 네비게이션 바 */}
      <nav className="bg-white border-b border-[#e9ecef] px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-[30px] h-[30px] rounded-md bg-[#178DD7] flex items-center justify-center">
            <MapPin className="text-white w-4 h-4" />
          </div>
          <span className="text-[15px] font-medium">AI 여행 플래너</span>
        </div>

        <div className="flex items-center gap-5">
          <span className="text-[13px] text-[#495057] cursor-pointer hover:text-[#212529]">서비스 소개</span>
          <span className="text-[13px] text-[#495057] cursor-pointer hover:text-[#212529]">이용 방법</span>

          {isAuthenticated ? (
            <>
              <span
                className="text-[13px] text-[#495057] cursor-pointer hover:text-[#212529]"
                onClick={() => { navigate('/trips'); }}
              >
                마이페이지
              </span>
              <button
                className="px-4 py-1.5 rounded-md text-[13px] border border-[#dee2e6] bg-transparent cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={logoutState}
              >
                로그아웃
              </button>
            </>
          ) : (
            <button
              className="px-4 py-1.5 rounded-md text-[13px] border border-[#dee2e6] bg-transparent cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => { navigate('/login'); }}
            >
              로그인
            </button>
          )}

          <button
            className="px-4 py-1.5 rounded-md text-[13px] border border-[#178DD7] bg-[#178DD7] text-white cursor-pointer hover:bg-[#147bc2] transition-colors"
            onClick={handleStart}
          >
            시작하기
          </button>
        </div>
      </nav>

      {/* 2. 히어로 섹션 */}
      <header className="px-8 pt-16 pb-16 text-center bg-white border-b border-[#e9ecef]">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E6F1FB] text-[#178DD7] text-xs font-medium mb-5">
          <Sparkles className="w-3.5 h-3.5" />
          AI 기반 여행 일정 자동 생성
        </div>
        <h1 className="text-3xl md:text-4xl font-semibold text-[#212529] leading-tight mb-4">
          여행 계획, 이제<br />
          <span className="text-[#178DD7]">AI에게 맡기세요</span>
        </h1>
        <p className="text-[15px] text-[#495057] mb-8 leading-relaxed max-w-[1200px] mx-auto">
          목적지와 예산만 입력하면 AI가 최적의 여행 일정을 만들어드려요.<br />
          지도에서 바로 확인하고 자유롭게 수정하세요.
        </p>
        <div className="flex gap-2.5 justify-center mb-14">
          <button
            className="px-6 py-2.5 rounded-md text-sm font-medium bg-[#178DD7] text-white hover:bg-[#147bc2] transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
            onClick={handleStart}
          >
            <Wand2 className="w-4 h-4" />
            무료로 시작하기 ↗
          </button>
          <button className="px-6 py-2.5 rounded-md text-sm font-medium bg-transparent border border-[#dee2e6] hover:bg-gray-50 transition-colors flex items-center gap-1.5 cursor-pointer">
            <Play className="w-3.5 h-3.5 fill-current" />
            데모 보기
          </button>
        </div>

        {/* 브라우저 프레임 */}
        <div className="bg-white border border-[#E9ECEF] rounded-[24px] p-8 max-w-4xl mx-auto text-left shadow-[0_12px_42px_rgba(0,0,0,0.04)]">
          <div className="flex gap-2 mb-6">
            <div className="w-2.5 h-2.5 rounded-full bg-[#CED4DA]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#CED4DA]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#CED4DA]" />
          </div>

          {/* 로그인 여부에 따라 분기 */}
          {isAuthenticated ? (
            /* ✅ 로그인 상태: 실제 내 일정 캐러셀 */
            <TripCarousel />
          ) : (
            /* 🔒 비로그인: 샘플 지도 + 예시 일정 뱃지 */
            <div className="flex flex-col gap-3">
              {/* 예시 일정 뱃지 */}
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FFF3CD] text-[#856404] text-[11px] font-medium">
                  ✨ 예시 일정입니다
                </div>
                <button
                  onClick={() => { navigate('/login'); }}
                  className="text-[12px] text-[#178DD7] hover:underline cursor-pointer"
                >
                  로그인하면 내 일정이 표시돼요 →
                </button>
              </div>

              {/* 샘플 TripPreviewCard */}
              <TripPreviewCard
                tripId={0}
                title="제주도 1일 여행"
                places={SAMPLE_PREVIEW_PLACES}
              />
            </div>
          )}
        </div>
      </header>

      {/* 3. 주요 기능 섹션 */}
      <section className="px-8 py-16 bg-white">
        <h2 className="text-center text-xl font-semibold mb-10 text-[#212529]">왜 AI 여행 플래너인가요?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">

          <div className="border border-[#e9ecef] rounded-xl p-5 bg-[#f8f9fa] hover:bg-white hover:shadow-md transition-all">
            <div className="w-9 h-9 rounded-lg bg-[#E6F1FB] text-[#178DD7] flex items-center justify-center mb-4">
              <Wand2 className="w-5 h-5" />
            </div>
            <h3 className="text-[15px] font-medium text-[#212529] mb-2">1초 만에 끝나는 설계</h3>
            <p className="text-[13px] text-[#6c757d] leading-relaxed">
              복잡한 검색 없이 원하는 키워드 몇 개만으로 동선 최적화가 끝난 맞춤형 일정을 추천받습니다.
            </p>
          </div>

          <div className="border border-[#e9ecef] rounded-xl p-5 bg-[#f8f9fa] hover:bg-white hover:shadow-md transition-all">
            <div className="w-9 h-9 rounded-lg bg-[#E6F1FB] text-[#178DD7] flex items-center justify-center mb-4">
              <Map className="w-5 h-5" />
            </div>
            <h3 className="text-[15px] font-medium text-[#212529] mb-2">직관적인 지도 연동</h3>
            <p className="text-[13px] text-[#6c757d] leading-relaxed">
              사이드바 리스트와 지도가 완벽히 동기화되어, 동선이 꼬이지 않는 스마트한 일정을 관리합니다.
            </p>
          </div>

          <div className="border border-[#e9ecef] rounded-xl p-5 bg-[#f8f9fa] hover:bg-white hover:shadow-md transition-all">
            <div className="w-9 h-9 rounded-lg bg-[#E6F1FB] text-[#178DD7] flex items-center justify-center mb-4">
              <Coins className="w-5 h-5" />
            </div>
            <h3 className="text-[15px] font-medium text-[#212529] mb-2">합리적인 비용 추정</h3>
            <p className="text-[13px] text-[#6c757d] leading-relaxed">
              선택한 테마와 장소 기반으로 AI가 예상 총 소요 비용을 미리 계산해주어 예산 수립을 도와줍니다.
            </p>
          </div>

        </div>
      </section>

      <footer className="border-t border-[#e9ecef] py-6 text-center text-[12px] text-[#adb5bd] bg-[#f8f9fa]">
        &copy; 2026 AI 여행 플래너. All rights reserved.
      </footer>
    </div>
  );
};

export default MainLandingPage;