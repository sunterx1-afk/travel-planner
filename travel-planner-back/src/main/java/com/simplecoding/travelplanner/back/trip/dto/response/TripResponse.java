package com.simplecoding.travelplanner.back.trip.dto.response;


import com.simplecoding.travelplanner.back.trip.entity.DaySchedule;
import com.simplecoding.travelplanner.back.trip.entity.SchedulePlace;
import com.simplecoding.travelplanner.back.trip.entity.Trip;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Builder
public class TripResponse {
    private Long tripId;
    private String title;
    private String destination;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer days;
    private Long budget;
    private String travelStyle;
    private Integer companions;
    private String status;
    private LocalDateTime createdAt;
    private List<DayScheduleResponse> schedules;

    public static TripResponse from(Trip trip) {
        return TripResponse.builder()
                .tripId(trip.getTripId())
                .title(trip.getTitle())
                .destination(trip.getDestination())
                .startDate(trip.getStartDate())
                .endDate(trip.getEndDate())
                .days(trip.getDays())
                .budget(trip.getBudget())
                .travelStyle(trip.getTravelStyle())
                .companions(trip.getCompanions())
                .status(trip.getStatus())
                .createdAt(trip.getCreatedAt())
                .schedules(trip.getSchedules().stream()
                        .map(DayScheduleResponse::from)
                        .collect(Collectors.toList()))
                .build();
    }

    @Getter
    @Builder
    public static class DayScheduleResponse {
        private Long dayId;
        private Integer dayNumber;
        private LocalDate scheduleDate;
        private String theme;
        private List<PlaceResponse> places;

        public static DayScheduleResponse from(DaySchedule daySchedule) {
            return DayScheduleResponse.builder()
                    .dayId(daySchedule.getDayId())
                    .dayNumber(daySchedule.getDayNumber())
                    .scheduleDate(daySchedule.getScheduleDate())
                    .theme(daySchedule.getTheme())
                    .places(daySchedule.getPlaces().stream()
                            .map(PlaceResponse::from)
                            .collect(Collectors.toList()))
                    .build();
        }
    }

    @Getter
    @Builder
    public static class PlaceResponse {
        private Long placeId;
        private Integer placeOrder;
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

        public static PlaceResponse from(SchedulePlace place) {
            return PlaceResponse.builder()
                    .placeId(place.getPlaceId())
                    .placeOrder(place.getPlaceOrder())
                    .placeName(place.getPlaceName())
                    .placeCategory(place.getPlaceCategory())
                    .address(place.getAddress())
                    .latitude(place.getLatitude())
                    .longitude(place.getLongitude())
                    .visitTime(place.getVisitTime())
                    .duration(place.getDuration())
                    .estimatedCost(place.getEstimatedCost())
                    .memo(place.getMemo())
                    .kakaoPlaceId(place.getKakaoPlaceId())
                    .build();
        }
    }
}