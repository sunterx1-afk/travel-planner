package com.simplecoding.travelplanner.back.Placecache.dto;


import com.simplecoding.travelplanner.back.Placecache.entity.PlaceCache;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PlaceResponse {
    private String kakaoPlaceId;
    private String placeName;
    private String category;
    private String address;
    private Double latitude;
    private Double longitude;
    private boolean fromCache;

    public static PlaceResponse fromCache(PlaceCache cache) {
        return PlaceResponse.builder()
                .kakaoPlaceId(cache.getKakaoPlaceId())
                .placeName(cache.getPlaceName())
                .category(cache.getCategory())
                .address(cache.getAddress())
                .latitude(cache.getLatitude())
                .longitude(cache.getLongitude())
                .fromCache(true)
                .build();
    }
}
