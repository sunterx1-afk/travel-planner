import api from './axios';

export interface PlaceSearchResult {
  kakaoPlaceId: string;
  placeName: string;
  category: string;
  address: string;
  latitude: number;
  longitude: number;
  fromCache: boolean;
}

// 장소 검색 (캐시 → 카카오 API)
export const searchPlaces = async (keyword: string): Promise<PlaceSearchResult[]> => {
  const response = await api.get<PlaceSearchResult[]>('/places/search', {
    params: { keyword },
  });
  return response.data;
};