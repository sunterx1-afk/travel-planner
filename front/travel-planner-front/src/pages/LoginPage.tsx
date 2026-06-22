import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { login } from '../service/authService';
import { useAuth } from '../context/AuthContext'; 

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { loginState } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // 1. 서버에 로그인 요청 (쿠키는 자동으로 브라우저에 저장됨)
      const response = await login({ email, password });
      
      // 2. 💡 수정: localStorage 대신 Context 상태에 유저 정보 저장
      loginState(response); 
      
      // 3. 메인으로 이동
      navigate('/trips');
    } catch (err: any) {
      setError(err.response?.data?.message || '이메일 또는 비밀번호가 올바르지 않아요.');
    } finally {
      setIsLoading(false);
    }
  };

const handleKakaoLogin = () => {
  const REST_API_KEY = "056b1be1440dee519bd6007c28ff34b5"; 
  const REDIRECT_URI = "http://localhost:5173/oauth/kakao"; 

  // 💡 끝에 &prompt=login을 추가하세요!
  const KAKAO_AUTH_URL = `https://kauth.kakao.com/oauth/authorize?client_id=${REST_API_KEY}&redirect_uri=${REDIRECT_URI}&response_type=code&prompt=login`;

  window.location.href = KAKAO_AUTH_URL;
};

  return (
    <div className="bg-[#f8f9fa] min-h-screen flex justify-center items-center p-5 font-sans antialiased text-[#212529]">
      <div className="bg-white border border-[#e9ecef] rounded-xl p-8 w-full max-w-[400px] shadow-sm">

        {/* 로고 */}
        <div className="flex items-center gap-2 justify-center mb-2 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-9 h-9 rounded-md bg-[#178DD7] flex items-center justify-center">
            <MapPin className="text-white w-5 h-5" />
          </div>
          <span className="text-[18px] font-medium text-[#212529]">AI 여행 플래너</span>
        </div>
        <div className="text-center text-[13px] text-[#6c757d] mb-7">계정에 로그인하세요</div>

        {/* 로그인 폼 */}
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

          {/* 에러 메시지 */}
          {error && (
            <div className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-md py-2 px-3">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2.5 rounded-md text-white border-none text-sm font-medium transition-colors mt-2
              ${isLoading ? 'bg-[#7ec2ed] cursor-not-allowed' : 'bg-[#178DD7] hover:bg-[#1278ba] cursor-pointer'}`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                로그인 중...
              </span>
            ) : '로그인'}
          </button>
        </form>

        {/* 구분선 */}
        <div className="flex items-center gap-2.5 my-5">
          <div className="flex-1 h-[0.5px] bg-[#dee2e6]"></div>
          <span className="text-xs text-[#adb5bd]">또는</span>
          <div className="flex-1 h-[0.5px] bg-[#dee2e6]"></div>
        </div>

        {/* 카카오 로그인 */}
        <button
          type="button"
          onClick={handleKakaoLogin}
          className="w-full py-2.5 px-3 rounded-md border border-[#F9E000] bg-[#F9E000] text-[#3C1E1E] text-[13px] font-medium cursor-pointer flex items-center justify-center gap-2 hover:bg-[#E6CC00] transition-colors"
        >
          <span className="text-sm">💬</span>
          카카오로 계속하기
        </button>

        {/* 회원가입 이동 */}
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