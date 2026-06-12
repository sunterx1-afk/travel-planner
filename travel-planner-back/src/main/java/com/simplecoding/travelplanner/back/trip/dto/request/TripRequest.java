package com.simplecoding.travelplanner.back.trip.dto.request;

import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@NoArgsConstructor
public class TripRequest {
    private String title;
    private String destination;
    private LocalDate startDate;
    private LocalDate endDate;
    private Long budget;
    private String travelStyle;
    private Integer companions;
    private String preferences;
}