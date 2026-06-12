package com.simplecoding.travelplanner.back.trip.repository;


import com.simplecoding.travelplanner.back.trip.entity.SchedulePlace;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SchedulePlaceRepository extends JpaRepository<SchedulePlace, Long> {
    List<SchedulePlace> findByDayScheduleDayIdOrderByPlaceOrderAsc(Long dayId);
    Optional<SchedulePlace> findByPlaceIdAndDayScheduleDayId(Long placeId, Long dayId);
}

