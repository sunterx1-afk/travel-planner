package com.simplecoding.travelplanner.back.trip.repository;


import com.simplecoding.travelplanner.back.trip.entity.Trip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TripRepository extends JpaRepository<Trip, Long> {
    List<Trip> findByUserUserIdOrderByCreatedAtDesc(Long userId);
    Optional<Trip> findByTripIdAndUserUserId(Long tripId, Long userId);
}