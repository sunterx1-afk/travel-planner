import api from './axios';

export interface TripRequest {
  title?: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  travelStyle: string;
  companions: number;
  preferences?: string;
}

export interface PlaceRequest {
  placeName: string;
  placeCategory: string;
  address: string;
  latitude: number;
  longitude: number;
  visitTime: string;
  duration: number;
  estimatedCost: number;
  memo?: string;
  kakaoPlaceId?: string;
}

export interface PlaceResponse {
  placeId: number;
  placeOrder: number;
  placeName: string;
  placeCategory: string;
  address: string;
  latitude: number;
  longitude: number;
  visitTime: string;
  duration: number;
  estimatedCost: number;
  memo: string;
  kakaoPlaceId: string;
}

export interface DayScheduleResponse {
  dayId: number;
  dayNumber: number;
  scheduleDate: string;
  theme: string;
  places: PlaceResponse[];
}

export interface TripResponse {
  tripId: number;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  days: number;
  budget: number;
  travelStyle: string;
  companions: number;
  status: string;
  createdAt: string;
  schedules: DayScheduleResponse[];
}

// 내 여행 목록 조회
export const getMyTrips = async (): Promise<TripResponse[]> => {
  const response = await api.get<TripResponse[]>('/api/trips');
  return response.data;
};

// 여행 단건 조회
export const getTripById = async (tripId: number): Promise<TripResponse> => {
  const response = await api.get<TripResponse>(`/api/trips/${tripId}`);
  return response.data;
};

// 여행 생성
export const createTrip = async (request: TripRequest): Promise<TripResponse> => {
  const response = await api.post<TripResponse>('/api/trips', request);
  return response.data;
};

// AI 일정 생성
export const createAiTrip = async (request: TripRequest): Promise<TripResponse> => {
  const response = await api.post<TripResponse>('/api/trips/ai', request);
  return response.data;
};

// 여행 수정
export const updateTrip = async (tripId: number, request: TripRequest): Promise<TripResponse> => {
  const response = await api.put<TripResponse>(`/api/trips/${tripId}`, request);
  return response.data;
};

// 여행 삭제
export const deleteTrip = async (tripId: number): Promise<void> => {
  await api.delete(`/api/trips/${tripId}`);
};

// 장소 추가
export const addPlace = async (
  tripId: number,
  dayNumber: number,
  request: PlaceRequest
): Promise<TripResponse> => {
  const response = await api.post<TripResponse>(
    `/api/trips/${tripId}/schedules/${dayNumber}/places`,
    request
  );
  return response.data;
};

// 장소 수정
export const updatePlace = async (
  tripId: number,
  dayNumber: number,
  placeId: number,
  request: PlaceRequest
): Promise<TripResponse> => {
  const response = await api.put<TripResponse>(
    `/api/trips/${tripId}/schedules/${dayNumber}/places/${placeId}`,
    request
  );
  return response.data;
};

// 장소 삭제
export const deletePlace = async (
  tripId: number,
  dayNumber: number,
  placeId: number
): Promise<TripResponse> => {
  const response = await api.delete<TripResponse>(
    `/api/trips/${tripId}/schedules/${dayNumber}/places/${placeId}`
  );
  return response.data;
};

// 장소 순서 변경
export const reorderPlaces = async (
  tripId: number,
  dayNumber: number,
  placeIds: number[]
): Promise<TripResponse> => {
  const response = await api.put<TripResponse>(
    `/api/trips/${tripId}/schedules/${dayNumber}/reorder`,
    { placeIds }
  );
  return response.data;
};