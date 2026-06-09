import { createBrowserRouter } from 'react-router-dom';
import MainLandingPage from '../page/MainLandingPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLandingPage />,
  },
  /* 💡 추후 다른 페이지들을 아래처럼 추가해 나가면 됩니다.
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/planner',
    element: <TravelPlannerPage />,
  },
  */
]);