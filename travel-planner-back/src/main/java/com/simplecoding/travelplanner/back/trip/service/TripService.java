package com.simplecoding.travelplanner.back.trip.service;


import com.simplecoding.travelplanner.back.trip.dto.request.PlaceRequest;
import com.simplecoding.travelplanner.back.trip.dto.request.TripRequest;
import com.simplecoding.travelplanner.back.trip.dto.response.TripResponse;
import com.simplecoding.travelplanner.back.trip.entity.DaySchedule;
import com.simplecoding.travelplanner.back.trip.entity.SchedulePlace;
import com.simplecoding.travelplanner.back.trip.entity.Trip;
import com.simplecoding.travelplanner.back.trip.repository.DayScheduleRepository;
import com.simplecoding.travelplanner.back.trip.repository.SchedulePlaceRepository;
import com.simplecoding.travelplanner.back.trip.repository.TripRepository;
import com.simplecoding.travelplanner.back.user.entity.User;
import com.simplecoding.travelplanner.back.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TripService {

    private final TripRepository tripRepository;
    private final UserRepository userRepository;
    private final DayScheduleRepository dayScheduleRepository;
    private final SchedulePlaceRepository schedulePlaceRepository;

    // 내 여행 목록 조회
    @Transactional(readOnly = true)
    public List<TripResponse> getMyTrips(Long userId) {
        return tripRepository.findByUserUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(TripResponse::from)
                .collect(Collectors.toList());
    }

    // 여행 단건 조회
    @Transactional(readOnly = true)
    public TripResponse getTrip(Long tripId, Long userId) {
        Trip trip = tripRepository.findByTripIdAndUserUserId(tripId, userId)
                .orElseThrow(() -> new IllegalArgumentException("여행을 찾을 수 없어요."));
        return TripResponse.from(trip);
    }

    // 여행 생성
    @Transactional
    public TripResponse createTrip(TripRequest request, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없어요."));

        int days = (int) (request.getEndDate().toEpochDay() - request.getStartDate().toEpochDay()) + 1;

        Trip trip = Trip.builder()
                .user(user)
                .title(request.getTitle())
                .destination(request.getDestination())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .days(days)
                .budget(request.getBudget())
                .travelStyle(request.getTravelStyle())
                .companions(request.getCompanions())
                .status("DRAFT")
                .build();

        tripRepository.save(trip);

        // 날짜별 DaySchedule 자동 생성
        for (int i = 0; i < days; i++) {
            DaySchedule daySchedule = DaySchedule.builder()
                    .trip(trip)
                    .dayNumber(i + 1)
                    .scheduleDate(request.getStartDate().plusDays(i))
                    .theme((i + 1) + "일차")
                    .build();
            dayScheduleRepository.save(daySchedule);
        }

        return TripResponse.from(tripRepository.findById(trip.getTripId()).orElseThrow());
    }

    // 여행 수정
    @Transactional
    public TripResponse updateTrip(Long tripId, TripRequest request, Long userId) {
        Trip trip = tripRepository.findByTripIdAndUserUserId(tripId, userId)
                .orElseThrow(() -> new IllegalArgumentException("여행을 찾을 수 없어요."));

        trip.setTitle(request.getTitle());
        trip.setDestination(request.getDestination());
        trip.setStartDate(request.getStartDate());
        trip.setEndDate(request.getEndDate());
        trip.setBudget(request.getBudget());
        trip.setTravelStyle(request.getTravelStyle());
        trip.setCompanions(request.getCompanions());

        return TripResponse.from(trip);
    }

    // 여행 삭제
    @Transactional
    public void deleteTrip(Long tripId, Long userId) {
        Trip trip = tripRepository.findByTripIdAndUserUserId(tripId, userId)
                .orElseThrow(() -> new IllegalArgumentException("여행을 찾을 수 없어요."));
        tripRepository.delete(trip);
    }

    // 장소 추가
    @Transactional
    public TripResponse addPlace(Long tripId, Integer dayNumber, PlaceRequest request, Long userId) {
        // 여행 소유자 확인
        tripRepository.findByTripIdAndUserUserId(tripId, userId)
                .orElseThrow(() -> new IllegalArgumentException("여행을 찾을 수 없어요."));

        DaySchedule daySchedule = dayScheduleRepository
                .findByTripTripIdAndDayNumber(tripId, dayNumber)
                .orElseThrow(() -> new IllegalArgumentException("일정을 찾을 수 없어요."));

        int nextOrder = daySchedule.getPlaces().size() + 1;

        SchedulePlace place = SchedulePlace.builder()
                .daySchedule(daySchedule)
                .placeOrder(nextOrder)
                .placeName(request.getPlaceName())
                .placeCategory(request.getPlaceCategory())
                .address(request.getAddress())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .visitTime(request.getVisitTime())
                .duration(request.getDuration())
                .estimatedCost(request.getEstimatedCost() != null ? request.getEstimatedCost() : 0L)
                .memo(request.getMemo())
                .kakaoPlaceId(request.getKakaoPlaceId())
                .build();

        schedulePlaceRepository.save(place);

        return TripResponse.from(tripRepository.findById(tripId).orElseThrow());
    }

    // 장소 수정
    @Transactional
    public TripResponse updatePlace(Long tripId, Integer dayNumber, Long placeId,
                                    PlaceRequest request, Long userId) {
        tripRepository.findByTripIdAndUserUserId(tripId, userId)
                .orElseThrow(() -> new IllegalArgumentException("여행을 찾을 수 없어요."));

        DaySchedule daySchedule = dayScheduleRepository
                .findByTripTripIdAndDayNumber(tripId, dayNumber)
                .orElseThrow(() -> new IllegalArgumentException("일정을 찾을 수 없어요."));

        SchedulePlace place = schedulePlaceRepository
                .findByPlaceIdAndDayScheduleDayId(placeId, daySchedule.getDayId())
                .orElseThrow(() -> new IllegalArgumentException("장소를 찾을 수 없어요."));

        place.setVisitTime(request.getVisitTime());
        place.setDuration(request.getDuration());
        place.setEstimatedCost(request.getEstimatedCost());
        place.setMemo(request.getMemo());

        return TripResponse.from(tripRepository.findById(tripId).orElseThrow());
    }

    // 장소 삭제
    @Transactional
    public TripResponse deletePlace(Long tripId, Integer dayNumber, Long placeId, Long userId) {
        tripRepository.findByTripIdAndUserUserId(tripId, userId)
                .orElseThrow(() -> new IllegalArgumentException("여행을 찾을 수 없어요."));

        DaySchedule daySchedule = dayScheduleRepository
                .findByTripTripIdAndDayNumber(tripId, dayNumber)
                .orElseThrow(() -> new IllegalArgumentException("일정을 찾을 수 없어요."));

        SchedulePlace place = schedulePlaceRepository
                .findByPlaceIdAndDayScheduleDayId(placeId, daySchedule.getDayId())
                .orElseThrow(() -> new IllegalArgumentException("장소를 찾을 수 없어요."));

        schedulePlaceRepository.delete(place);

        // 순서 재정렬
        List<SchedulePlace> remaining = schedulePlaceRepository
                .findByDayScheduleDayIdOrderByPlaceOrderAsc(daySchedule.getDayId());
        for (int i = 0; i < remaining.size(); i++) {
            remaining.get(i).setPlaceOrder(i + 1);
        }

        return TripResponse.from(tripRepository.findById(tripId).orElseThrow());
    }

    // 장소 순서 변경
    @Transactional
    public TripResponse reorderPlaces(Long tripId, Integer dayNumber,
                                      List<Long> placeIds, Long userId) {
        tripRepository.findByTripIdAndUserUserId(tripId, userId)
                .orElseThrow(() -> new IllegalArgumentException("여행을 찾을 수 없어요."));

        DaySchedule daySchedule = dayScheduleRepository
                .findByTripTripIdAndDayNumber(tripId, dayNumber)
                .orElseThrow(() -> new IllegalArgumentException("일정을 찾을 수 없어요."));

        List<SchedulePlace> places = schedulePlaceRepository
                .findByDayScheduleDayIdOrderByPlaceOrderAsc(daySchedule.getDayId());

        for (int i = 0; i < placeIds.size(); i++) {
            final int order = i + 1;
            final Long id = placeIds.get(i);
            places.stream()
                    .filter(p -> p.getPlaceId().equals(id))
                    .findFirst()
                    .ifPresent(p -> p.setPlaceOrder(order));
        }

        return TripResponse.from(tripRepository.findById(tripId).orElseThrow());
    }
}
