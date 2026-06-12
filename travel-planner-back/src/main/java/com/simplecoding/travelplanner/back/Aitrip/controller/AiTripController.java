//package com.simplecoding.travelplanner.back.Aitrip.controller;
//
//
//import com.simplecoding.travelplanner.back.Aitrip.service.AiTripService;
//import com.simplecoding.travelplanner.back.trip.dto.request.TripRequest;
//import com.simplecoding.travelplanner.back.trip.dto.response.TripResponse;
//import lombok.RequiredArgsConstructor;
//import org.springframework.http.ResponseEntity;
//import org.springframework.security.core.Authentication;
//import org.springframework.web.bind.annotation.*;
//
//@RestController
//@RequestMapping("/api/trips")
//@RequiredArgsConstructor
//public class AiTripController {
//
//    private final AiTripService aiTripService;
//
//    private Long getUserId(Authentication auth) {
//        return (Long) auth.getPrincipal();
//    }
//
//    // AI 일정 생성
//    @PostMapping("/ai")
//    public ResponseEntity<TripResponse> generateAiTrip(@RequestBody TripRequest request,
//                                                       Authentication auth) {
//        return ResponseEntity.ok(aiTripService.generateAiTrip(request, getUserId(auth)));
//    }
//}