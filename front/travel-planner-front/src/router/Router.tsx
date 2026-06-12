import { createBrowserRouter } from 'react-router-dom';
// 💡 새로 만든 가드 임포트
import MainLandingPage from '../pages/MainLandingPage';
import LoginPage from '../pages/LoginPage';
import SignupPage from '../pages/SignupPage';
import TripCreatePage from '../pages/TripCreatePage';
import TripResultPage from '../pages/TripResultPage';
import PlannerPage from '../pages/PlannerPage';
import TripListPage from '../pages/TripListPage';
import TripDetailPage from '../pages/Tripdetailpage';
import AuthGuard from '../components/AuthGuard';

export const router = createBrowserRouter([
  // 1. 누구나 접근 가능한 페이지
  { path: '/', element: <MainLandingPage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/signup', element: <SignupPage /> },
  
  // 2. 💡 AuthGuard로 감싸서 로그인한 유저만 접근 가능하게 설정
  {
    element: <AuthGuard />,
    children: [
      { path: '/planner', element: <TripCreatePage /> },
      { path: '/trips/result', element: <TripResultPage /> },
      { path: '/trips/:id/planner', element: <PlannerPage /> },
      { path: '/trips', element: <TripListPage /> },
      { path: '/trips/:id', element: <TripDetailPage /> },
    ],
  },
]);