import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './context/AuthContext' // 💡 AuthProvider 임포트 추가

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* 💡 AuthProvider로 App을 감싸주세요 */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)