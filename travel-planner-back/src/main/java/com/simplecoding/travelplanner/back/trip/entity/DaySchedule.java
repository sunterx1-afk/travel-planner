package com.simplecoding.travelplanner.back.trip.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "DAY_SCHEDULES")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DaySchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "day_schedules_seq")
    @SequenceGenerator(name = "day_schedules_seq", sequenceName = "DAY_SCHEDULES_SEQ", allocationSize = 1)
    @Column(name = "DAY_ID")
    private Long dayId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "TRIP_ID", nullable = false)
    private Trip trip;

    @Column(name = "DAY_NUMBER", nullable = false)
    private Integer dayNumber;

    @Column(name = "SCHEDULE_DATE", nullable = false)
    private LocalDate scheduleDate;

    @Column(name = "THEME", length = 100)
    private String theme;

    @OneToMany(mappedBy = "daySchedule", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("PLACE_ORDER ASC")
    @Builder.Default
    private List<SchedulePlace> places = new ArrayList<>();
}