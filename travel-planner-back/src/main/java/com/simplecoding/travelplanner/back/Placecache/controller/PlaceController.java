package com.simplecoding.travelplanner.back.Placecache.controller;


import com.simplecoding.travelplanner.back.Placecache.dto.PlaceResponse;
import com.simplecoding.travelplanner.back.Placecache.service.PlaceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/places")
@RequiredArgsConstructor
public class PlaceController {

    private final PlaceService placeService;

    // 장소 검색 (캐시 → 카카오 API)
    @GetMapping("/search")
    public ResponseEntity<List<PlaceResponse>> searchPlaces(
            @RequestParam String keyword) {
        return ResponseEntity.ok(placeService.searchPlaces(keyword));
    }
}
