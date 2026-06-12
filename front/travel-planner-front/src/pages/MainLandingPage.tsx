import React from 'react';
import { MapPin, Sparkles, Wand2, Play, Map, Coins } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // 💡 훅 임포트

const MainLandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logoutState } = useAuth(); // 💡 인증 상태 및 로그아웃 함수

  const handleStart = (): void => {
    navigate('/planner');
  };

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
          
          {/* 💡 로그인 상태에 따른 조건부 렌더링 */}
          {isAuthenticated ? (
            <>
              <span className="text-[13px] text-[#495057] cursor-pointer hover:text-[#212529]" onClick={() => navigate('/trips')}>마이페이지</span>
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
              onClick={() => navigate('/login')}
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
      <header className="px-8 pt-16 pb-12 text-center bg-white">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E6F1FB] text-[#178DD7] text-xs font-medium mb-5">
          <Sparkles className="w-3.5 h-3.5" />
          AI 기반 여행 일정 자동 생성
        </div>
        <h1 className="text-3xl md:text-4xl font-medium text-[#212529] leading-tight mb-3.5">
          여행 계획, 이제<br /><span className="text-[#178DD7]">AI에게 맡기세요</span>
        </h1>
        <p className="text-[15px] text-[#495057] mb-7 leading-relaxed max-w-[480px] mx-auto">
          목적지와 예산만 입력하면 AI가 최적의 여행 일정을 만들어드려요.<br />
          지도에서 바로 확인하고 자유롭게 수정하세요.
        </p>
        <div className="flex gap-2.5 justify-center mb-10">
          <button 
            className="px-6 py-2.5 rounded-md text-sm font-medium bg-[#178DD7] text-white hover:bg-[#147bc2] transition-colors flex items-center gap-1.5" 
            onClick={handleStart}
          >
            <Wand2 className="w-4 h-4" />
            무료로 시작하기 ↗
          </button>
          <button className="px-6 py-2.5 rounded-md text-sm font-medium bg-transparent border border-[#dee2e6] hover:bg-gray-50 transition-colors flex items-center gap-1.5">
            <Play className="w-3.5 h-3.5 fill-current" />
            데모 보기
          </button>
        </div>

        {/* 대시보드 미리보기 */}
        <div className="bg-[#f8f9fa] border border-[#dee2e6] rounded-xl p-4 max-w-[560px] mx-auto text-left shadow-sm">
          <div className="flex gap-1.5 mb-3">
            <div className="w-2 h-2 rounded-full bg-[#ced4da]"></div>
            <div className="w-2 h-2 rounded-full bg-[#ced4da]"></div>
            <div className="w-2 h-2 rounded-full bg-[#ced4da]"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="bg-[#d4e8d4] rounded-md h-[120px] relative overflow-hidden flex items-center justify-center">
              <div className="absolute top-[30%] left-0 right-0 h-[2px] bg-white/60"></div>
              <div className="absolute top-[60%] left-0 right-0 h-[2px] bg-white/60"></div>
              <div className="absolute left-[40%] top-0 bottom-0 w-[2px] bg-white/60"></div>
              <div className="absolute w-5 h-5 rounded-full bg-[#178DD7] text-white text-[10px] font-medium flex items-center justify-center border-[1.5px] border-white left-[20%] top-[20%]">1</div>
              <div className="absolute w-5 h-5 rounded-full bg-[#178DD7] text-white text-[10px] font-medium flex items-center justify-center border-[1.5px] border-white left-[50%] top-[40%]">2</div>
              <div className="absolute w-5 h-5 rounded-full bg-[#178DD7] text-white text-[10px] font-medium flex items-center justify-center border-[1.5px] border-white left-[65%] top-[60%]">3</div>
            </div>
            <div className="flex flex-col gap-1.5">
              {[
                { num: 1, name: '성산일출봉', time: '09:00 · 2시간' },
                { num: 2, name: '섭지코지', time: '11:30 · 1시간' },
                { num: 3, name: '흑돼지거리', time: '13:00 · 1시간' }
              ].map((place) => (
                <div key={place.num} className="bg-white border border-[#dee2e6] rounded-md p-2.5 flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-[#178DD7] text-white text-[10px] flex items-center justify-center flex-shrink-0">{place.num}</div>
                  <div>
                    <div className="text-xs font-medium">{place.name}</div>
                    <div className="text-[11px] text-[#6c757d]">{place.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* 3. 주요 기능 섹션 */}
      <section className="px-8 py-12 bg-white border-t border-[#e9ecef)">
        <h2 className="text-center text-xl font-medium mb-2">왜 AI 여행 플래너인가요?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           {/* 특징 카드들 (생략) */}
        </div>
      </section>

      {/* 푸터 (생략) */}
    </div>
  );
};

export default MainLandingPage;