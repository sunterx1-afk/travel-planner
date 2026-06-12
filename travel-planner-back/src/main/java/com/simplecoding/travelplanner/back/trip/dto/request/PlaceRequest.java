package com.simplecoding.travelplanner.back.trip.dto.request;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class PlaceRequest {
    private String placeName;
    private String placeCategory;
    private String address;
    private Double latitude;
    private Double longitude;
    private String visitTime;
    private Integer duration;
    private Long estimatedCost;
    private String memo;
    private String kakaoPlaceId;
}