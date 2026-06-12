package com.simplecoding.travelplanner.back.trip.repository;


import com.simplecoding.travelplanner.back.trip.entity.DaySchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DayScheduleRepository extends JpaRepository<DaySchedule, Long> {
    Optional<DaySchedule> findByTripTripIdAndDayNumber(Long tripId, Integer dayNumber);
}