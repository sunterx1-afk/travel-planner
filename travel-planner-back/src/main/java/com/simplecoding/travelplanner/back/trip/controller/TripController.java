package com.simplecoding.travelplanner.back.trip.controller;


import com.simplecoding.travelplanner.back.Aitrip.service.AiTripService;
import com.simplecoding.travelplanner.back.trip.dto.request.PlaceRequest;
import com.simplecoding.travelplanner.back.trip.dto.request.TripRequest;
import com.simplecoding.travelplanner.back.trip.dto.response.TripResponse;
import com.simplecoding.travelplanner.back.trip.service.TripService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/trips")
@RequiredArgsConstructor
public class TripController {

    private final TripService tripService;
    private final AiTripService aiTripService;

    // 현재 로그인한 유저 ID 추출
    private Long getUserId(Authentication auth) {
        return (Long) auth.getPrincipal();
    }

    // 내 여행 목록 조회
    @GetMapping
    public ResponseEntity<List<TripResponse>> getMyTrips(Authentication auth) {
        return ResponseEntity.ok(tripService.getMyTrips(getUserId(auth)));
    }

    // 여행 단건 조회
    @GetMapping("/{tripId}")
    public ResponseEntity<TripResponse> getTrip(@PathVariable Long tripId,
                                                Authentication auth) {
        return ResponseEntity.ok(tripService.getTrip(tripId, getUserId(auth)));
    }

    // 여행 생성
    @PostMapping
    public ResponseEntity<TripResponse> createTrip(@RequestBody TripRequest request,
                                                   Authentication auth) {
        return ResponseEntity.ok(tripService.createTrip(request, getUserId(auth)));
    }

    // 여행 수정
    @PutMapping("/{tripId}")
    public ResponseEntity<TripResponse> updateTrip(@PathVariable Long tripId,
                                                   @RequestBody TripRequest request,
                                                   Authentication auth) {
        return ResponseEntity.ok(tripService.updateTrip(tripId, request, getUserId(auth)));
    }

    // 여행 삭제
    @DeleteMapping("/{tripId}")
    public ResponseEntity<String> deleteTrip(@PathVariable Long tripId,
                                             Authentication auth) {
        tripService.deleteTrip(tripId, getUserId(auth));
        return ResponseEntity.ok("여행이 삭제됐어요.");
    }

    // 장소 추가
    @PostMapping("/{tripId}/schedules/{dayNumber}/places")
    public ResponseEntity<TripResponse> addPlace(@PathVariable Long tripId,
                                                 @PathVariable Integer dayNumber,
                                                 @RequestBody PlaceRequest request,
                                                 Authentication auth) {
        return ResponseEntity.ok(tripService.addPlace(tripId, dayNumber, request, getUserId(auth)));
    }

    // 장소 수정
    @PutMapping("/{tripId}/schedules/{dayNumber}/places/{placeId}")
    public ResponseEntity<TripResponse> updatePlace(@PathVariable Long tripId,
                                                    @PathVariable Integer dayNumber,
                                                    @PathVariable Long placeId,
                                                    @RequestBody PlaceRequest request,
                                                    Authentication auth) {
        return ResponseEntity.ok(tripService.updatePlace(tripId, dayNumber, placeId, request, getUserId(auth)));
    }

    // 장소 삭제
    @DeleteMapping("/{tripId}/schedules/{dayNumber}/places/{placeId}")
    public ResponseEntity<TripResponse> deletePlace(@PathVariable Long tripId,
                                                    @PathVariable Integer dayNumber,
                                                    @PathVariable Long placeId,
                                                    Authentication auth) {
        return ResponseEntity.ok(tripService.deletePlace(tripId, dayNumber, placeId, getUserId(auth)));
    }

    // 장소 순서 변경
    @PutMapping("/{tripId}/schedules/{dayNumber}/reorder")
    public ResponseEntity<TripResponse> reorderPlaces(@PathVariable Long tripId,
                                                      @PathVariable Integer dayNumber,
                                                      @RequestBody Map<String, List<Long>> body,
                                                      Authentication auth) {
        List<Long> placeIds = body.get("placeIds");
        return ResponseEntity.ok(tripService.reorderPlaces(tripId, dayNumber, placeIds, getUserId(auth)));
    }

    // AI 일정 생성
    @PostMapping("/ai")
    public ResponseEntity<TripResponse> generateAiTrip(@RequestBody TripRequest request,
                                                       Authentication auth) {
        return ResponseEntity.ok(aiTripService.generateAiTrip(request, getUserId(auth)));
    }
}
