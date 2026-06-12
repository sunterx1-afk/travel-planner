package com.simplecoding.travelplanner.back.trip.entity;

import com.simplecoding.travelplanner.back.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "TRIPS")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Trip {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "trips_seq")
    @SequenceGenerator(name = "trips_seq", sequenceName = "TRIPS_SEQ", allocationSize = 1)
    @Column(name = "TRIP_ID")
    private Long tripId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "USER_ID", nullable = false)
    private User user;

    @Column(name = "TITLE", nullable = false, length = 100)
    private String title;

    @Column(name = "DESTINATION", nullable = false, length = 100)
    private String destination;

    @Column(name = "START_DATE", nullable = false)
    private LocalDate startDate;

    @Column(name = "END_DATE", nullable = false)
    private LocalDate endDate;

    @Column(name = "DAYS", nullable = false)
    private Integer days;

    @Column(name = "BUDGET", nullable = false)
    private Long budget;

    @Column(name = "TRAVEL_STYLE", length = 20)
    private String travelStyle;

    @Column(name = "COMPANIONS", nullable = false)
    private Integer companions;

    @Column(name = "STATUS", length = 20)
    @Builder.Default
    private String status = "DRAFT";

    @CreationTimestamp
    @Column(name = "CREATED_AT", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "UPDATED_AT")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "trip", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("dayNumber ASC")
    @Builder.Default
    private List<DaySchedule> schedules = new ArrayList<>();
}
