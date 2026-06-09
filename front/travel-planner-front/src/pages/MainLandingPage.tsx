import React from 'react';
// 💡 타입스크립트 에러가 나지 않는 깔끔한 Lucide 아이콘 라이브러리입니다.
import { MapPin, Sparkles, Wand2, Play, Map, Coins } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // 💡 이 줄을 추가해 주세요!

interface MainLandingPageProps {
  onStart?: () => void;
}

interface StepItem {
  num: number;
  title: string;
  desc: string;
}

const MainLandingPage: React.FC<MainLandingPageProps> = ({ onStart }) => {
  const navigate = useNavigate(); // 💡 이동 함수 선언!
  
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
          <button className="px-4 py-1.5 rounded-md text-[13px] border border-[#dee2e6] bg-transparent cursor-pointer hover:bg-gray-50 transition-colors"onClick={() => navigate('/login')}>
            로그인
          </button>
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

        {/* 대시보드 미리보기 그래픽 */}
        <div className="bg-[#f8f9fa] border border-[#dee2e6] rounded-xl p-4 max-w-[560px] mx-auto text-left shadow-sm">
          <div className="flex gap-1.5 mb-3">
            <div className="w-2 h-2 rounded-full bg-[#ced4da]"></div>
            <div className="w-2 h-2 rounded-full bg-[#ced4da]"></div>
            <div className="w-2 h-2 rounded-full bg-[#ced4da]"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* 가상 지도 UI */}
            <div className="bg-[#d4e8d4] rounded-md h-[120px] relative overflow-hidden flex items-center justify-center">
              <div className="absolute top-[30%] left-0 right-0 h-[2px] bg-white/60"></div>
              <div className="absolute top-[60%] left-0 right-0 h-[2px] bg-white/60"></div>
              <div className="absolute left-[40%] top-0 bottom-0 w-[2px] bg-white/60"></div>
              <div className="absolute w-5 h-5 rounded-full bg-[#178DD7] text-white text-[10px] font-medium flex items-center justify-center border-[1.5px] border-white left-[20%] top-[20%]">1</div>
              <div className="absolute w-5 h-5 rounded-full bg-[#178DD7] text-white text-[10px] font-medium flex items-center justify-center border-[1.5px] border-white left-[50%] top-[40%]">2</div>
              <div className="absolute w-5 h-5 rounded-full bg-[#178DD7] text-white text-[10px] font-medium flex items-center justify-center border-[1.5px] border-white left-[65%] top-[60%]">3</div>
              <svg className="absolute inset-0 w-full h-full">
                <polyline points="50,30 110,55 135,80" fill="none" stroke="#178DD7" strokeWidth="1.5" strokeDasharray="4,3" className="opacity-80" />
              </svg>
            </div>
            {/* 추천 일정 목록 UI */}
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

      {/* 3. 주요 기능 특징 섹션 */}
      <section className="px-8 py-12 bg-white border-t border-[#e9ecef]">
        <h2 className="text-center text-xl font-medium mb-2">왜 AI 여행 플래너인가요?</h2>
        <p className="text-center text-[13px] text-[#6c757d] mb-8">복잡한 여행 계획을 AI가 대신 해드려요</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#f8f9fa] rounded-xl p-5">
            <div className="w-9 h-9 rounded-md bg-[#E6F1FB] flex items-center justify-center mb-3">
              <Wand2 className="w-5 h-5 text-[#178DD7]" />
            </div>
            <h3 className="text-sm font-medium mb-1.5">AI 일정 자동 생성</h3>
            <p className="text-xs text-[#6c757d] leading-relaxed">목적지, 기간, 예산, 여행 스타일만 입력하면 최적의 일정을 자동으로 만들어드려요.</p>
          </div>
          <div className="bg-[#f8f9fa] rounded-xl p-5">
            <div className="w-9 h-9 rounded-md bg-[#EAF3DE] flex items-center justify-center mb-3">
              <Map className="w-5 h-5 text-[#639922]" />
            </div>
            <h3 className="text-sm font-medium mb-1.5">지도 연동 시각화</h3>
            <p className="text-xs text-[#6c757d] leading-relaxed">카카오맵과 연동해 일정의 모든 장소를 지도에서 한눈에 확인할 수 있어요.</p>
          </div>
          <div className="bg-[#f8f9fa] rounded-xl p-5">
            <div className="w-9 h-9 rounded-md bg-[#FAEEDA] flex items-center justify-center mb-3">
              <Coins className="w-5 h-5 text-[#BA7517]" />
            </div>
            <h3 className="text-sm font-medium mb-1.5">예산 자동 계산</h3>
            <p className="text-xs text-[#6c757d] leading-relaxed">입장료, 식비, 교통비를 자동으로 합산해 예산 내에서 여행할 수 있도록 도와드려요.</p>
          </div>
        </div>
      </section>

      {/* 4. 이용 방법 단계 섹션 */}
      <section className="px-8 py-12 bg-[#f8f9fa] border-t border-[#e9ecef]">
        <h2 className="text-center text-xl font-medium mb-2">이렇게 사용하세요</h2>
        <p className="text-center text-[13px] text-[#6c757d] mb-7">단 4단계로 완성되는 나만의 여행 일정</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mt-7">
          {[
            { num: 1, title: '여행 정보 입력', desc: '목적지, 기간, 예산, 여행 스타일 선택' },
            { num: 2, title: 'AI 일정 생성', desc: 'AI가 최적의 일정을 자동으로 생성' },
            { num: 3, title: '지도에서 확인', desc: '카카오맵에서 장소 위치 한눈에 확인' },
            { num: 4, title: '저장 & 공유', desc: '일정 저장하고 언제든지 확인' }
          ].map((item: StepItem) => (
            <div key={item.num} className="text-center">
              <div className="w-8 h-8 rounded-full bg-[#178DD7] text-white text-sm font-medium flex items-center justify-center mx-auto mb-2.5">
                {item.num}
              </div>
              <h4 className="text-[13px] font-medium mb-1">{item.title}</h4>
              <p className="text-xs text-[#6c757d]">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. 하단 유도 (CTA) */}
      <section className="px-8 py-12 text-center bg-white border-t border-[#e9ecef]">
        <h2 className="text-2xl font-medium mb-2">지금 바로 여행 계획을 시작하세요</h2>
        <p className="text-sm text-[#6c757d] mb-6">회원가입 없이도 AI 일정 생성을 체험할 수 있어요</p>
        <button 
          className="px-6 py-2.5 rounded-md text-sm font-medium bg-[#178DD7] text-white hover:bg-[#147bc2] transition-colors" 
          onClick={handleStart}
        >
          무료로 시작하기 ↗
        </button>
      </section>

      {/* 6. 푸터 */}
      <footer className="px-8 py-5 bg-[#f8f9fa] border-t border-[#e9ecef] flex items-center justify-between">
        <span className="text-[13px] font-medium text-[#6c757d]">AI 여행 플래너</span>
        <span className="text-xs text-[#adb5bd]">© 2026 AI Travel Planner. All rights reserved.</span>
      </footer>
    </div>
  );
};

export default MainLandingPage;