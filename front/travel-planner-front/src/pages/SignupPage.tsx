import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Eye, EyeOff } from 'lucide-react';
import axios from '../service/axios';

interface SignupForm {
  email: string;
  password: string;
  passwordConfirm: string;
  nickname: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  passwordConfirm?: string;
  nickname?: string;
}

const SignupPage: React.FC = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState<SignupForm>({
    email: '',
    password: '',
    passwordConfirm: '',
    nickname: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // 입력 시 해당 필드 에러 초기화
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!form.email) {
      newErrors.email = '이메일을 입력해주세요.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다.';
    }

    if (!form.nickname) {
      newErrors.nickname = '닉네임을 입력해주세요.';
    } else if (form.nickname.length < 2) {
      newErrors.nickname = '닉네임은 2자 이상 입력해주세요.';
    }

    if (!form.password) {
      newErrors.password = '비밀번호를 입력해주세요.';
    } else if (form.password.length < 8) {
      newErrors.password = '비밀번호는 8자 이상 입력해주세요.';
    }

    if (!form.passwordConfirm) {
      newErrors.passwordConfirm = '비밀번호 확인을 입력해주세요.';
    } else if (form.password !== form.passwordConfirm) {
      newErrors.passwordConfirm = '비밀번호가 일치하지 않습니다.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

const handleSubmit = async (e: React.FormEvent): Promise<void> => { // async 추가
  e.preventDefault();
  if (!validate()) return;

  try {
    // 2. 실제 백엔드 서버로 POST 요청 전송
    const response = await axios.post('/api/auth/register', {
      email: form.email,
      password: form.password,
      nickname: form.nickname
    });

    // 3. 서버 응답이 성공(200번대)일 때만 알림
    console.log('서버 응답:', response.data);
    alert('회원가입이 완료되었습니다!');
    navigate('/login');
    
  } catch (error) {
    // 4. 에러 발생 시 (DB 저장 실패, 이메일 중복 등)
    console.error('회원가입 실패:', error);
    alert('회원가입에 실패했습니다. 다시 시도해주세요.');
  }
};

  const handleKakaoSignup = (): void => {
    // 💡 추후 카카오 OAuth2 연동할 공간
    console.log('카카오 회원가입 시도');
    alert('카카오 로그인 페이지로 이동합니다.');
  };

  return (
    <div className="bg-[#f8f9fa] min-h-screen flex justify-center items-center p-5 font-sans antialiased text-[#212529]">
      <div className="bg-white border border-[#e9ecef] rounded-xl p-8 w-full max-w-[400px] shadow-sm">

        {/* 로고 */}
        <div
          className="flex items-center gap-2 justify-center mb-2 cursor-pointer"
          onClick={() => navigate('/')}
        >
          <div className="w-9 h-9 rounded-md bg-[#178DD7] flex items-center justify-center">
            <MapPin className="text-white w-5 h-5" />
          </div>
          <span className="text-[18px] font-medium text-[#212529]">AI 여행 플래너</span>
        </div>
        <div className="text-center text-[13px] text-[#6c757d] mb-7">새 계정을 만들어보세요</div>

        {/* 회원가입 폼 */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* 이메일 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-[#212529]">이메일</label>
            <input
              className={`w-full py-2 px-3 border rounded-md text-sm bg-white text-[#212529] focus:outline-none transition-colors
                ${errors.email ? 'border-red-400 focus:border-red-400' : 'border-[#dee2e6] focus:border-[#178DD7]'}`}
              type="email"
              name="email"
              placeholder="example@email.com"
              value={form.email}
              onChange={handleChange}
            />
            {errors.email && (
              <span className="text-xs text-red-500">{errors.email}</span>
            )}
          </div>

          {/* 닉네임 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-[#212529]">닉네임</label>
            <input
              className={`w-full py-2 px-3 border rounded-md text-sm bg-white text-[#212529] focus:outline-none transition-colors
                ${errors.nickname ? 'border-red-400 focus:border-red-400' : 'border-[#dee2e6] focus:border-[#178DD7]'}`}
              type="text"
              name="nickname"
              placeholder="닉네임을 입력하세요"
              value={form.nickname}
              onChange={handleChange}
            />
            {errors.nickname && (
              <span className="text-xs text-red-500">{errors.nickname}</span>
            )}
          </div>

          {/* 비밀번호 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-[#212529]">비밀번호</label>
            <div className="relative">
              <input
                className={`w-full py-2 px-3 pr-10 border rounded-md text-sm bg-white text-[#212529] focus:outline-none transition-colors
                  ${errors.password ? 'border-red-400 focus:border-red-400' : 'border-[#dee2e6] focus:border-[#178DD7]'}`}
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="8자 이상 입력하세요"
                value={form.password}
                onChange={handleChange}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#adb5bd] hover:text-[#6c757d]"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <span className="text-xs text-red-500">{errors.password}</span>
            )}
          </div>

          {/* 비밀번호 확인 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-[#212529]">비밀번호 확인</label>
            <div className="relative">
              <input
                className={`w-full py-2 px-3 pr-10 border rounded-md text-sm bg-white text-[#212529] focus:outline-none transition-colors
                  ${errors.passwordConfirm ? 'border-red-400 focus:border-red-400' : 'border-[#dee2e6] focus:border-[#178DD7]'}`}
                type={showPasswordConfirm ? 'text' : 'password'}
                name="passwordConfirm"
                placeholder="비밀번호를 다시 입력하세요"
                value={form.passwordConfirm}
                onChange={handleChange}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#adb5bd] hover:text-[#6c757d]"
                onClick={() => setShowPasswordConfirm((prev) => !prev)}
              >
                {showPasswordConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.passwordConfirm && (
              <span className="text-xs text-red-500">{errors.passwordConfirm}</span>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-md bg-[#178DD7] text-white border-none text-sm font-medium cursor-pointer hover:bg-[#1278ba] transition-colors mt-2"
          >
            회원가입
          </button>
        </form>

        {/* 구분선 */}
        <div className="flex items-center gap-2.5 my-5">
          <div className="flex-1 h-[0.5px] bg-[#dee2e6]"></div>
          <span className="text-xs text-[#adb5bd]">또는</span>
          <div className="flex-1 h-[0.5px] bg-[#dee2e6]"></div>
        </div>

        {/* 카카오 회원가입 */}
        <button
          type="button"
          onClick={handleKakaoSignup}
          className="w-full py-2.5 px-3 rounded-md border border-[#F9E000] bg-[#F9E000] text-[#3C1E1E] text-[13px] font-medium cursor-pointer flex items-center justify-center gap-2 hover:bg-[#E6CC00] transition-colors"
        >
          <span className="text-sm">💬</span>
          카카오로 계속하기
        </button>

        {/* 로그인 이동 */}
        <div className="text-center text-[13px] text-[#6c757d] mt-5">
          이미 계정이 있으신가요?{' '}
          <span
            className="text-[#178DD7] cursor-pointer hover:underline"
            onClick={() => navigate('/login')}
          >
            로그인 ↗
          </span>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;