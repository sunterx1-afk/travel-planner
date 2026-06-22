import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080',
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 💡 토큰 재발급 중복 호출 방지용 플래그 + 대기열
let isRefreshing = false;
let refreshSubscribers: (() => void)[] = [];

const onRefreshed = () => {
  refreshSubscribers.forEach((callback) => callback());
  refreshSubscribers = [];
};

// 응답 인터셉터
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    // 🚀 [핵심] 일반 유저의 401뿐만 아니라, 카카오 유저에게 발생하는 403 에러도 만료로 인정하고 가로챕니다!
if (
  (status === 401 || status === 403) && 
  !originalRequest._retry &&
  !originalRequest.url?.includes('/api/auth/refresh') &&
  !originalRequest.url?.includes('/api/auth/login') &&
  !originalRequest.url?.includes('/api/auth/register')
) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          refreshSubscribers.push(() => {
            resolve(api(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // 💡 이제 403 에러가 나면 네트워크 탭에 이 refresh 요청이 찍히게 됩니다!
        await api.post('/api/auth/refresh');

        isRefreshing = false;
        onRefreshed();

        return api(originalRequest);
} catch (refreshError) {
  isRefreshing = false;
  refreshSubscribers = [];
  
  // 💡 /me 요청이면 강제 이동 안 함 (AuthContext가 처리)
  if (!originalRequest.url?.includes('/api/auth/me')) {
    window.location.href = '/login';
  }
  
  return Promise.reject(refreshError);
}
    }

    return Promise.reject(error);
  }
);

export default api;