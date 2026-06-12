package com.simplecoding.travelplanner.back.Placecache.repository;


import com.simplecoding.travelplanner.back.Placecache.entity.PlaceCache;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PlaceCacheRepository extends JpaRepository<PlaceCache, Long> {
    Optional<PlaceCache> findByKakaoPlaceId(String kakaoPlaceId);
    List<PlaceCache> findByPlaceNameContainingIgnoreCase(String keyword);
}
