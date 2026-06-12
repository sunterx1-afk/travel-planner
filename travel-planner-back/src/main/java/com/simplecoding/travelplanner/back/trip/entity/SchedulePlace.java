package com.simplecoding.travelplanner.back.trip.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "SCHEDULE_PLACES")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SchedulePlace {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "schedule_places_seq")
    @SequenceGenerator(name = "schedule_places_seq", sequenceName = "SCHEDULE_PLACES_SEQ", allocationSize = 1)
    @Column(name = "PLACE_ID")
    private Long placeId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "DAY_ID", nullable = false)
    private DaySchedule daySchedule;

    @Column(name = "PLACE_ORDER", nullable = false)
    private Integer placeOrder;

    @Column(name = "PLACE_NAME", nullable = false, length = 100)
    private String placeName;

    @Column(name = "PLACE_CATEGORY", length = 50)
    private String placeCategory;

    @Column(name = "ADDRESS", length = 200)
    private String address;

    @Column(name = "LATITUDE")
    private Double latitude;

    @Column(name = "LONGITUDE")
    private Double longitude;

    @Column(name = "VISIT_TIME", length = 10)
    private String visitTime;

    @Column(name = "DURATION")
    private Integer duration;

    @Column(name = "ESTIMATED_COST")
    @Builder.Default
    private Long estimatedCost = 0L;

    @Column(name = "MEMO", length = 500)
    private String memo;

    @Column(name = "KAKAO_PLACE_ID", length = 50)
    private String kakaoPlaceId;
}
