import { createBrowserRouter } from 'react-router-dom';
import MainLandingPage from '../pages/MainLandingPage';
import LoginPage from '../pages/LoginPage';
import SignupPage from '../pages/SignupPage';
import TripCreatePage from '../pages/TripCreatePage';
import TripResultPage from '../pages/TripResultPage';
import PlannerPage from '../pages/PlannerPage';
import TripListPage from '../pages/TripListPage';
import TripDetailPage from '../pages/Tripdetailpage';


export const router = createBrowserRouter([
  {path: '/',element: <MainLandingPage />,},
  {path: '/login',element: <LoginPage />,},
  {path: '/signup',element: <SignupPage />,},
  {path: '/planner',element: <TripCreatePage  />,},
  {path: '/trips/result',element: <TripResultPage   />,},
  {path: '/trips/:id/planner',element: <PlannerPage    />,},
  {path: '/trips',element: <TripListPage     />,},
  {path: '/tripsdetail',element: <TripDetailPage     />,},
  
 
]);