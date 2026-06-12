import api from './axios';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  nickname: string;
}

export interface AuthResponse {
  userId: number;
  email: string;
  nickname: string;
  message: string;
}

// 회원가입
export const register = async (request: RegisterRequest): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/api/auth/register', request);
  return response.data;
};

// 로그인
export const login = async (request: LoginRequest): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/api/auth/login', request);
  return response.data;
};

// 로그아웃
export const logout = async (): Promise<void> => {
  await api.post('/api/auth/logout');
  localStorage.removeItem('nickname');
  localStorage.removeItem('userId');
};

// 현재 로그인 유저 조회
export const getCurrentUser = async (): Promise<AuthResponse> => {
  const response = await api.get<AuthResponse>('/api/auth/me');
  return response.data;
};