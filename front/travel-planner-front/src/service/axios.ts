import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080',
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 응답 인터셉터
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 💡 인터셉터에서 무조건 리다이렉트하지 않습니다.
    // 401 에러가 발생했다는 사실만 호출부(AuthContext)로 전달합니다.
    return Promise.reject(error);
  }
);

export default api;