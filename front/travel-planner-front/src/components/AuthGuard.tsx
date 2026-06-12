// src/components/AuthGuard.tsx
import { useAuth } from '../context/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';

const AuthGuard = () => {
  const { isAuthenticated, loading } = useAuth();

  // 💡 로딩 중일 때는 무조건 대기합니다. (로그인 페이지로 이동 금지)
  if (loading) {
    return <div>로딩 중입니다...</div>; // 원하는 로딩 스피너로 교체 가능
  }

  // 💡 로딩이 다 끝난 후, 로그인 안 되어 있으면 그때 로그인 페이지로 이동
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default AuthGuard;