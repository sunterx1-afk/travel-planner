import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, logout, type AuthResponse } from '../service/authService';

interface AuthContextType {
  user: AuthResponse | null;
  isAuthenticated: boolean;
  loading: boolean;
  loginState: (userData: AuthResponse) => void;
  logoutState: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // 화면이 처음 켜질 때 백엔드에 쿠키를 보내서 로그인 상태를 확인
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  // 로그인 성공 시 상태 업데이트
  const loginState = (userData: AuthResponse) => setUser(userData);

  // 로그아웃 시 백엔드 API 호출 후 상태 초기화
  const logoutState = async () => {
    try {
      await logout(); // 백엔드 API 호출 → 쿠키 삭제
    } catch (error) {
      console.error('로그아웃 실패:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('nickname');
      localStorage.removeItem('userId');
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, loginState, logoutState }}>
      {children}
    </AuthContext.Provider>
  );
};

// 커스텀 훅
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth는 AuthProvider 안에서만 사용 가능합니다.');
  return context;
};