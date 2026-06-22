import React, { useState } from 'react';

export default function InfoModals() {
  const [isIntroOpen, setIsIntroOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // 공통 모달 배경 스타일 (Tailwind CSS 기준, 일반 CSS인 경우 인라인 스타일이나 클래스로 대체 가능)
  const modalOverlayStyle = "fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm transition-opacity";
  const modalContentStyle = "bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl transform transition-all border border-gray-100 relative mx-4";
  const closeButtonStyle = "absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl font-bold focus:outline-none";

  return (
    <div className="flex gap-4 p-4">
      {/* 💡 트리거 버튼들 */}
      <button 
        onClick={() => setIsIntroOpen(true)}
        className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
      >
        서비스 소개
      </button>
      
      <button 
        onClick={() => setIsGuideOpen(true)}
        className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-md shadow-blue-100"
      >
        이용 방법
      </button>

      {/* 1️⃣ 서비스 소개 모달 */}
      {isIntroOpen && (
        <div className={modalOverlayStyle} onClick={() => setIsIntroOpen(false)}>
          <div className={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <button className={closeButtonStyle} onClick={() => setIsIntroOpen(false)}>×</button>
            
            <div className="text-center mb-4">
              <span className="text-4xl">✈️</span>
              <h2 className="text-xl font-bold text-gray-800 mt-2">AI 여행 플래너 소개</h2>
              <p className="text-xs text-blue-600 font-semibold mt-1">Smart AI & Kakao Map Mapping System</p>
            </div>
            
            <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
              <p>
                모든 일정을 직접 짜기엔 숨 막히고, 가짜 정보에 속기는 지치셨나요? 
                우리 서비스는 사용자의 예산, 동반자, 취향을 분석하여 <strong>LLM 기반 최첨단 AI</strong>가 개인 맞춤형 스케줄을 빌드합니다.
              </p>
              <div className="bg-blue-50 rounded-xl p-3 text-xs text-blue-800 font-medium">
                📢 <strong>핵심 기술 요약</strong><br/>
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
              <h2 className="text-xl font-bold text-gray-800 mt-2">쉽고 빠른 이용 방법</h2>
              <p className="text-xs text-gray-400 mt-1">3단계만 거치면 나만의 여행 완성!</p>
            </div>
            
            <div className="space-y-4 text-sm text-gray-700">
              <div className="flex items-start gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 font-bold text-xs shrink-0 mt-0.5">1</span>
                <div>
                  <h4 className="font-semibold text-gray-800">목적지 및 일정 입력</h4>
                  <p className="text-xs text-gray-500 mt-0.5">원하는 여행지(예: 제주도, 세종시, 강릉)와 출발·도착 날짜를 정확히 지정합니다.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 font-bold text-xs shrink-0 mt-0.5">2</span>
                <div>
                  <h4 className="font-semibold text-gray-800">취향 및 조건 설정</h4>
                  <p className="text-xs text-gray-500 mt-0.5">총 예산, 동반 인원수, 선호하는 여행 스타일(맛집탐방, 자연힐링 등)을 선택해 주세요.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs shrink-0 mt-0.5">3</span>
                <div>
                  <h4 className="font-semibold text-blue-600">AI 일정 생성 및 확인</h4>
                  <p className="text-xs text-gray-500 mt-0.5">생성 버튼을 누르면 카카오 지도 위에 동선이 실시간으로 맵핑되며, 하루 치 지출 금액까지 알차게 계산된 일정을 확인할 수 있습니다.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}