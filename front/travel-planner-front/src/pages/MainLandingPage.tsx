import React, { useState } from 'react';
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

  // 💡 1. 모달 열림/닫힘 상태 관리
  const [isIntroOpen, setIsIntroOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // 💡 2. 모달 공통 TailWind 스타일 정의
  const modalOverlayStyle = "fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity animate-fade-in";
  const modalContentStyle = "bg-white rounded-[20px] p-6 w-full max-w-md shadow-[0_20px_50px_rgba(0,0,0,0.15)] transform transition-all border border-gray-100 relative mx-4 text-left";
  const closeButtonStyle = "absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl font-bold focus:outline-none cursor-pointer";

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
          {/* 💡 3. 네비게이션 항목 이벤트 바인딩 */}
          <span 
            className="text-[13px] text-[#495057] cursor-pointer hover:text-[#212529] font-medium transition-colors"
            onClick={() => setIsIntroOpen(true)}
          >
            서비스 소개
          </span>
          <span 
            className="text-[13px] text-[#495057] cursor-pointer hover:text-[#212529] font-medium transition-colors"
            onClick={() => setIsGuideOpen(true)}
          >
            이용 방법
          </span>

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
        </div>

        {/* 브라우저 프레임 */}
        <div className="bg-white border border-[#E9ECEF] rounded-[24px] p-8 max-w-4xl mx-auto text-left shadow-[0_12px_42px_rgba(0,0,0,0.04)]">
          <div className="flex gap-2 mb-6">
            <div className="w-2.5 h-2.5 rounded-full bg-[#CED4DA]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#CED4DA]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#CED4DA]" />
          </div>

          {isAuthenticated ? (
            <TripCarousel />
          ) : (
            <div className="flex flex-col gap-3">
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

      {/* ─── 💡 4. 팝업 모달 렌더링 구역 ─── */}

      {/* 1️⃣ 서비스 소개 모달 */}
      {isIntroOpen && (
        <div className={modalOverlayStyle} onClick={() => setIsIntroOpen(false)}>
          <div className={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <button className={closeButtonStyle} onClick={() => setIsIntroOpen(false)}>×</button>
            
            <div className="text-center mb-4">
              <span className="text-4xl">✈️</span>
              <h2 className="text-lg font-semibold text-[#212529] mt-2">AI 여행 플래너 소개</h2>
              <p className="text-xs text-[#178DD7] font-semibold mt-1">Smart AI & Kakao Map Mapping System</p>
            </div>
            
            <div className="space-y-3 text-[13px] text-[#495057] leading-relaxed">
              <p>
                모든 일정을 직접 짜기엔 숨 막히고, 가짜 정보에 속기는 지치셨나요? 
                우리 서비스는 사용자의 예산, 동반자, 취향을 분석하여 <strong>LLM 기반 최첨단 AI</strong>가 개인 맞춤형 스케줄을 빌드합니다.
              </p>
              <div className="bg-[#E6F1FB] rounded-xl p-3 text-xs text-[#147bc2] font-medium">
                📢 <strong className="text-[#178DD7]">핵심 기술 요약</strong><br/>
                AI가 추천한 장소 키워드를 백엔드에서 <strong>카카오 맵 API</strong>와 실시간 매칭·검증하여, 오타나 유령 장소 없이 국내에 실제 운영 중인 매장의 정확한 좌표와 주소만을 엄선해 지도에 마커로 시각화합니다.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2️⃣ 이용 방법 모달 */}
      {isGuideOpen && (
        <div className={modalOverlayStyle} onClick={() => setIsGuideOpen(false)}>
          <div className={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <button className={closeButtonStyle} onClick={() => setIsGuideOpen(false)}>×</button>
            
            <div className="text-center mb-4">
              <span className="text-4xl">🗺️</span>
              <h2 className="text-lg font-semibold text-[#212529] mt-2">쉽고 빠른 이용 방법</h2>
              <p className="text-xs text-gray-400 mt-1">3단계만 거치면 나만의 여행 완성!</p>
            </div>
            
            <div className="space-y-4 text-[13px] text-[#495057]">
              <div className="flex items-start gap-3">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#E6F1FB] text-[#178DD7] font-bold text-xs shrink-0 mt-0.5">1</span>
                <div>
                  <h4 className="font-medium text-[#212529]">목적지 및 일정 입력</h4>
                  <p className="text-xs text-gray-500 mt-0.5">원하는 여행지(예: 제주도, 세종시, 강릉)와 출발·도착 날짜를 정확히 지정합니다.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#E6F1FB] text-[#178DD7] font-bold text-xs shrink-0 mt-0.5">2</span>
                <div>
                  <h4 className="font-medium text-[#212529]">취향 및 조건 설정</h4>
                  <p className="text-xs text-gray-500 mt-0.5">총 예산, 동반 인원수, 선호하는 여행 스타일(맛집탐방, 자연힐링 등)을 선택해 주세요.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#178DD7] text-white font-bold text-xs shrink-0 mt-0.5">3</span>
                <div>
                  <h4 className="font-medium text-[#178DD7]">AI 일정 생성 및 확인</h4>
                  <p className="text-xs text-gray-500 mt-0.5">생성 버튼을 누르면 카카오 지도 위에 동선이 실시간으로 맵핑되며, 하루 치 지출 금액까지 알차게 계산된 일정을 확인할 수 있습니다.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="border-t border-[#e9ecef] py-6 text-center text-[12px] text-[#adb5bd] bg-[#f8f9fa]">
        &copy; 2026 AI 여행 플래너. All rights reserved.
      </footer>
    </div>
  );
};

export default MainLandingPage;