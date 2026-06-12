package com.simplecoding.travelplanner.back.Aitrip.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.simplecoding.travelplanner.back.trip.dto.request.TripRequest;
import com.simplecoding.travelplanner.back.trip.dto.response.TripResponse;
import com.simplecoding.travelplanner.back.trip.entity.DaySchedule;
import com.simplecoding.travelplanner.back.trip.entity.SchedulePlace;
import com.simplecoding.travelplanner.back.trip.entity.Trip;
import com.simplecoding.travelplanner.back.trip.repository.*;
import com.simplecoding.travelplanner.back.user.entity.User;
import com.simplecoding.travelplanner.back.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
@RequiredArgsConstructor
public class AiTripService {

    private final TripRepository tripRepository;
    private final UserRepository userRepository;
    private final DayScheduleRepository dayScheduleRepository;
    private final SchedulePlaceRepository schedulePlaceRepository;
    private final ObjectMapper objectMapper;

    // 💡 application.properties에 groq.api.key=YOUR_KEY 추가
    @Value("${groq.api.key}")
    private String groqApiKey;

    private static final String GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

    @Transactional
    public TripResponse generateAiTrip(TripRequest request, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없어요."));

        int days = (int) (request.getEndDate().toEpochDay() - request.getStartDate().toEpochDay()) + 1;

        // 1. Groq API 호출
        String aiResponse = callGroqApi(request, days);

        // 2. AI 응답 파싱
        AiPlanResult planResult = parseAiResponse(aiResponse, request.getDestination(), days);

        // 3. Trip 엔티티 저장
        Trip trip = Trip.builder()
                .user(user)
                .title(planResult.title)
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

        // 4. DaySchedule + SchedulePlace 저장
        for (int i = 0; i < planResult.schedules.size(); i++) {
            AiDaySchedule aiDay = planResult.schedules.get(i);
            DaySchedule daySchedule = DaySchedule.builder()
                    .trip(trip)
                    .dayNumber(i + 1)
                    .scheduleDate(request.getStartDate().plusDays(i))
                    .theme(aiDay.theme)
                    .build();
            dayScheduleRepository.save(daySchedule);

            for (int j = 0; j < aiDay.places.size(); j++) {
                AiPlace aiPlace = aiDay.places.get(j);
                SchedulePlace place = SchedulePlace.builder()
                        .daySchedule(daySchedule)
                        .placeOrder(j + 1)
                        .placeName(aiPlace.placeName)
                        .placeCategory(aiPlace.placeCategory)
                        .address(aiPlace.address)
                        .visitTime(aiPlace.visitTime)
                        .duration(aiPlace.duration)
                        .estimatedCost(aiPlace.estimatedCost)
                        .memo(aiPlace.description)
                        .build();
                schedulePlaceRepository.save(place);
            }
        }

        return TripResponse.from(tripRepository.findById(trip.getTripId()).orElseThrow());
    }

    // Groq API 호출
    private String callGroqApi(TripRequest request, int days) {
        RestTemplate restTemplate = new RestTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(groqApiKey);

        String prompt = buildPrompt(request, days);

        Map<String, Object> body = new HashMap<>();
        body.put("model", "llama-3.3-70b-versatile");
        body.put("temperature", 0.7);
        body.put("max_tokens", 4096);

        Map<String, Object> message = new HashMap<>();
        message.put("role", "user");
        message.put("content", prompt);
        body.put("messages", List.of(message));

        // JSON 응답 강제
        Map<String, Object> responseFormat = new HashMap<>();
        responseFormat.put("type", "json_object");
        body.put("response_format", responseFormat);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        ResponseEntity<String> response = restTemplate.postForEntity(GROQ_URL, entity, String.class);
        return response.getBody();
    }

    // 프롬프트 생성
    private String buildPrompt(TripRequest request, int days) {
        return String.format("""
            당신은 여행 플래너 AI입니다.
            아래 조건으로 여행 일정을 JSON 형식으로만 반환하세요. 다른 텍스트는 절대 포함하지 마세요.
            
            [여행 정보]
            - 목적지: %s
            - 기간: %d일
            - 예산: %,d원
            - 여행 스타일: %s
            - 인원: %d명
            - 추가 요청: %s
            
            [여행 스타일별 장소 구성 가이드 - 반드시 스타일에 맞게 구성하세요]
            - RELAXED (여유로운): 카페, 산책로, 힐링 스팟 위주. 무리한 이동 없이 여유롭게 구성
            - ACTIVE (액티브): 등산, 스포츠, 체험 활동 위주. 활동적인 장소로 구성
            - CULTURAL (문화탐방): 박물관, 유적지, 역사 명소 위주로 구성
            - FOOD (맛집탐방): 유명 맛집, 현지 음식, 카페 위주. 하루 일정의 절반 이상을 음식점/카페로 채우고 해당 지역 유명 음식을 반드시 포함하세요
            - NATURE (자연힐링): 자연경관, 해변, 공원, 산 위주로 구성
            현재 여행 스타일은 '%s' 입니다. 이 스타일에 철저히 맞게 장소를 구성해주세요.
            
                        [estimatedCost 가격 책정 가이드 - 반드시 지켜주세요]
                        - 음식점, 카페, 시장은 절대 0원이 될 수 없습니다
                        - 무료(0원)는 공원, 해변, 산책로, 무료 관광지만 해당됩니다
                        - 무료 관광지 (공원, 해변, 산책로 등): 0원
                        - 유료 관광지 입장료: 실제 입장료 기준 (예: 성산일출봉 5,000원)
                        - 카페 음료: 6,000 ~ 10,000원
                        - 분식/패스트푸드: 7,000 ~ 12,000원
                        - 한식 일반 식당: 9,000 ~ 15,000원
                        - 해산물 식당: 20,000 ~ 40,000원
                        - 고기집 (삼겹살, 갈비): 25,000 ~ 45,000원
                        - 한우 식당/직판장: 40,000 ~ 80,000원
                        - 제주 흑돼지: 20,000 ~ 35,000원
                        - 일식 (초밥, 라멘 등): 15,000 ~ 30,000원
                        - 양식 (파스타, 스테이크): 20,000 ~ 50,000원
                        - 시장 음식 (1인 기준): 10,000 ~ 20,000원
                        - 교통비 (버스/지하철 1회): 1,500 ~ 2,500원
                        - 배편 왕복 (우도 등): 10,000 ~ 20,000원
                        - 숙박은 estimatedCost에 포함하지 마세요
                        - placeCategory가 음식점/카페/시장인 경우 estimatedCost는 반드시 1원 이상이어야 합니다
            
            [반환할 JSON 형식]
            {
              "title": "여행 제목",
              "schedules": [
                {
                  "dayNumber": 1,
                  "theme": "1일차 테마",
                  "places": [
                    {
                      "placeName": "장소명",
                      "placeCategory": "카테고리(관광명소/음식점/카페/해변 등)",
                      "address": "주소",
                      "visitTime": "09:00",
                      "duration": 120,
                      "estimatedCost": 5000,
                      "description": "장소 설명"
                    }
                  ]
                }
              ]
            }
            
            [일정 규칙]
            - 하루 3~5개 장소 추천
            - duration은 분 단위 숫자
            - visitTime은 HH:mm 형식
            - 장소 간 이동 시간을 고려해서 일정을 짜주세요
            
            [estimatedCost 가격 책정 가이드 - 1인 기준 현실적으로]
            - 무료 관광지 (공원, 해변, 산책로 등): 0원
            - 유료 관광지 입장료: 실제 입장료 기준 (예: 성산일출봉 5,000원, 한라산 무료)
            - 카페 음료: 6,000 ~ 10,000원
            - 분식/패스트푸드: 7,000 ~ 12,000원
            - 한식 일반 식당 (백반, 국밥 등): 9,000 ~ 15,000원
            - 해산물 식당: 20,000 ~ 40,000원
            - 고기집 (삼겹살, 갈비, 한우 등): 25,000 ~ 60,000원
            - 제주 흑돼지: 20,000 ~ 35,000원
            - 일식 (초밥, 라멘 등): 15,000 ~ 30,000원
            - 양식 (파스타, 스테이크): 20,000 ~ 50,000원
            - 교통비 (버스/지하철 1회): 1,500 ~ 2,500원
            - 택시 (단거리): 5,000 ~ 15,000원
            - 배편 왕복 (우도 등): 10,000 ~ 20,000원
            - 렌터카 (1일): 50,000 ~ 100,000원
            - 숙박은 estimatedCost에 포함하지 마세요
            """,
                request.getDestination(),
                days,
                request.getBudget(),
                request.getTravelStyle(),
                request.getCompanions(),
                request.getPreferences() != null ? request.getPreferences() : "없음",
                request.getTravelStyle()
        );
    }
    // Groq 응답 파싱
    private AiPlanResult parseAiResponse(String rawResponse, String destination, int days) {
        try {
            JsonNode root = objectMapper.readTree(rawResponse);

            // Groq 응답에서 content 추출
            String jsonText = root
                    .path("choices").get(0)
                    .path("message")
                    .path("content")
                    .asText();

            // 마크다운 제거
            String cleanJson = jsonText
                    .replaceAll("```json", "")
                    .replaceAll("```", "")
                    .trim();

            JsonNode plan = objectMapper.readTree(cleanJson);

            AiPlanResult result = new AiPlanResult();
            result.title = plan.path("title").asText(destination + " " + days + "일 여행");
            result.schedules = new ArrayList<>();

            for (JsonNode dayNode : plan.path("schedules")) {
                AiDaySchedule aiDay = new AiDaySchedule();
                aiDay.theme = dayNode.path("theme").asText();
                aiDay.places = new ArrayList<>();

                for (JsonNode placeNode : dayNode.path("places")) {
                    AiPlace aiPlace = new AiPlace();
                    aiPlace.placeName = placeNode.path("placeName").asText();
                    aiPlace.placeCategory = placeNode.path("placeCategory").asText();
                    aiPlace.address = placeNode.path("address").asText();
                    aiPlace.visitTime = placeNode.path("visitTime").asText("09:00");
                    aiPlace.duration = placeNode.path("duration").asInt(60);
                    aiPlace.estimatedCost = placeNode.path("estimatedCost").asLong(0);
                    aiPlace.description = placeNode.path("description").asText();
                    aiDay.places.add(aiPlace);
                }
                result.schedules.add(aiDay);
            }

            return result;

        } catch (Exception e) {
            throw new RuntimeException("AI 응답 파싱 실패: " + e.getMessage());
        }
    }

    private static class AiPlanResult {
        String title;
        List<AiDaySchedule> schedules;
    }

    private static class AiDaySchedule {
        String theme;
        List<AiPlace> places;
    }

    private static class AiPlace {
        String placeName, placeCategory, address, visitTime, description;
        int duration;
        long estimatedCost;
    }


}