import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin } from 'lucide-react';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // 일반 이메일 로그인 처리
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // 💡 추후 백엔드 로그인 API 연동할 공간
    console.log('로그인 시도:', { email, password });
    alert('로그인이 완료되었습니다!');
    navigate('/'); 
  };

  // 카카오 로그인 처리
  const handleKakaoLogin = () => {
    // 💡 추후 카카오 OAuth2 백엔드 인증 URL로 이동시키거나 SDK 호출할 공간
    console.log('카카오 로그인 시도');
    alert('카카오 로그인 페이지로 이동합니다.');
    // 예시: window.location.href = KAKAO_AUTH_URL;
  };

  return (
    <div className="bg-[#f8f9fa] min-h-screen flex justify-center items-center p-5 font-sans antialiased text-[#212529]">
      <div className="bg-white border border-[#e9ecef] rounded-xl p-8 w-full max-w-[400px] shadow-sm">
        
        {/* 상단 로고 영역 */}
        <div className="flex items-center gap-2 justify-center mb-2 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-9 h-9 rounded-md bg-[#178DD7] flex items-center justify-center">
            <MapPin className="text-white w-5 h-5" />
          </div>
          <span className="text-[18px] font-medium text-[#212529]">AI 여행 플래너</span>
        </div>
        <div className="text-center text-[13px] text-[#6c757d] mb-7">계정에 로그인하세요</div>

        {/* 일반 로그인 폼 */}
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-[#212529]">이메일</label>
            <input 
              className="w-full py-2 px-3 border border-[#dee2e6] rounded-md text-sm bg-white text-[#212529] focus:outline-none focus:border-[#178DD7] transition-colors" 
              type="email" 
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-[#212529]">비밀번호</label>
            <input 
              className="w-full py-2 px-3 border border-[#dee2e6] rounded-md text-sm bg-white text-[#212529] focus:outline-none focus:border-[#178DD7] transition-colors" 
              type="password" 
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div className="text-right text-xs text-[#6c757d] mt-1 cursor-pointer hover:text-[#178DD7] transition-colors">
              비밀번호를 잊으셨나요?
            </div>
          </div>

          <button 
            type="submit"
            className="w-full py-2.5 rounded-md bg-[#178DD7] text-white border-none text-sm font-medium cursor-pointer hover:bg-[#1278ba] transition-colors mt-2"
          >
            로그인
          </button>
        </form>

        {/* 구분선 */}
        <div className="flex items-center gap-2.5 my-5">
          <div className="flex-1 h-[0.5px] bg-[#dee2e6]"></div>
          <span className="text-xs text-[#adb5bd]">또는</span>
          <div className="flex-1 h-[0.5px] bg-[#dee2e6]"></div>
        </div>

        {/* 소셜 로그인 버튼 영역 (카카오 전용) */}
        <div className="flex flex-col gap-2">
          <button 
            type="button"
            onClick={handleKakaoLogin}
            className="w-full py-2.5 px-3 rounded-md border border-[#F9E000] bg-[#F9E000] text-[#3C1E1E] text-[13px] font-medium cursor-pointer flex items-center justify-center gap-2 hover:bg-[#E6CC00] transition-colors"
          >
            <span className="text-sm">💬</span>
            카카오로 계속하기
          </button>
        </div>

        {/* 하단 회원가입 유도 링크 */}
        <div className="text-center text-[13px] text-[#6c757d] mt-5">
          계정이 없으신가요?{' '}
          <span 
            className="text-[#178DD7] cursor-pointer hover:underline"
            onClick={() => navigate('/signup')} 
          >
            회원가입 ↗
          </span>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;