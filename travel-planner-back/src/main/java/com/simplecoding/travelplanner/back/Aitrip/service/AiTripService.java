package com.simplecoding.travelplanner.back.Aitrip.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.simplecoding.travelplanner.back.Placecache.dto.PlaceResponse;
import com.simplecoding.travelplanner.back.Placecache.service.PlaceService;
import com.simplecoding.travelplanner.back.trip.dto.request.TripRequest;
import com.simplecoding.travelplanner.back.trip.dto.response.TripResponse;
import com.simplecoding.travelplanner.back.trip.entity.DaySchedule;
import com.simplecoding.travelplanner.back.trip.entity.SchedulePlace;
import com.simplecoding.travelplanner.back.trip.entity.Trip;
import com.simplecoding.travelplanner.back.trip.repository.*;
import com.simplecoding.travelplanner.back.user.entity.User;
import com.simplecoding.travelplanner.back.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiTripService {

    private final TripRepository tripRepository;
    private final UserRepository userRepository;
    private final DayScheduleRepository dayScheduleRepository;
    private final SchedulePlaceRepository schedulePlaceRepository;
    private final ObjectMapper objectMapper;
    private final PlaceService placeService;

    @Value("${groq.api.key}")
    private String groqApiKey;

    private static final String GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

    @Transactional
    public TripResponse generateAiTrip(TripRequest request, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없어요."));

        int days = (int) (request.getEndDate().toEpochDay() - request.getStartDate().toEpochDay()) + 1;

        // 💡 [근본 해결 1] 사용자가 "제주도", "세종시", "부산시" 등 어떻게 입력하든 최상단에서 주소 필터링용 핵심 키워드로 정제합니다.
        String originalDestination = request.getDestination();
        String displayDestination = originalDestination; // AI 프롬프트에 제공할 행정구역명
        String addressTarget = originalDestination;       // 카카오 맵 검색 및 주소 검증용 핵심 단어

        if (addressTarget != null) {
            addressTarget = addressTarget.trim();

            // 1단계: 맨 뒤의 '시', '도', '구', '군'을 먼저 무조건 제거 ("제주도" -> "제주", "세종시" -> "세종")
            if (addressTarget.length() > 2 &&
                    (addressTarget.endsWith("시") || addressTarget.endsWith("도") ||
                            addressTarget.endsWith("구") || addressTarget.endsWith("군"))) {
                addressTarget = addressTarget.substring(0, addressTarget.length() - 1);
            }

            // 2단계: 특수 행정구역 표준화 및 오타 방어
            if (addressTarget.contains("제주") || addressTarget.contains("재주")) {
                displayDestination = "제주특별자치도";
                addressTarget = "제주";
            } else if (addressTarget.contains("세종")) {
                displayDestination = "세종특별자치시";
                addressTarget = "세종";
            }
        }

        // 💡 [근본 해결 2] 정제된 displayDestination과 addressTarget을 프롬프트 생성 메서드에 동기화하여 전달합니다.
        String aiResponse = callGroqApi(request, days, displayDestination, addressTarget);

        // AI 응답 파싱
        AiPlanResult planResult = parseAiResponse(aiResponse, originalDestination, days);

        // Trip 엔티티 저장
        Trip trip = Trip.builder()
                .user(user)
                .title(planResult.title)
                .destination(originalDestination)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .days(days)
                .budget(request.getBudget())
                .travelStyle(request.getTravelStyle())
                .companions(request.getCompanions())
                .status("DRAFT")
                .build();

        tripRepository.save(trip);

        // DaySchedule + SchedulePlace 저장
        for (int i = 0; i < planResult.schedules.size(); i++) {
            AiDaySchedule aiDay = planResult.schedules.get(i);
            DaySchedule daySchedule = DaySchedule.builder()
                    .trip(trip)
                    .dayNumber(i + 1)
                    .scheduleDate(request.getStartDate().plusDays(i))
                    .theme(aiDay.theme)
                    .build();
            dayScheduleRepository.save(daySchedule);

            Double lastLatitude = null;
            Double lastLongitude = null;
            int realPlaceOrder = 1;

            for (int j = 0; j < aiDay.places.size(); j++) {
                AiPlace aiPlace = aiDay.places.get(j);

                boolean isTransport = "교통".equals(aiPlace.placeCategory);

                String exactPlaceName = aiPlace.placeName;
                String exactAddress = aiPlace.address;
                Double latitude = null;
                Double longitude = null;
                String kakaoPlaceId = null;

                if (isTransport) {
                    if (lastLatitude != null && lastLongitude != null) {
                        latitude = lastLatitude;
                        longitude = lastLongitude;
                    } else {
                        latitude = 0.0;
                        longitude = 0.0;
                    }
                    log.info("[교통 항목] 카카오 검색 생략 -> {} (좌표: {}, {})", aiPlace.placeName, latitude, longitude);

                } else {
                    // 💡 [근본 해결 3] 카카오 맵 API 호출 시, 정제된 핵심 단어(addressTarget -> "제주", "세종")를 넘겨주어 검증 누락을 방어합니다.
                    String searchQuery = addressTarget + " " + aiPlace.placeName;
                    log.info("[AI 좌표 조회 시작] 검색 키워드 -> {} (지역 검증 핵심어: {})", searchQuery, addressTarget);

                    // placeService 내부 검증 로직에도 정제된 "제주"가 넘어가므로 카카오의 "제주특별자치도..." 주소와 100% 매칭됩니다.
                    List<PlaceResponse> kakaoPlaces = placeService.searchPlaces(searchQuery, addressTarget);

                    if (kakaoPlaces != null && !kakaoPlaces.isEmpty()) {
                        PlaceResponse exactPlace = kakaoPlaces.get(0);

                        exactPlaceName = exactPlace.getPlaceName();
                        exactAddress = exactPlace.getAddress();
                        latitude = exactPlace.getLatitude();
                        longitude = exactPlace.getLongitude();
                        kakaoPlaceId = exactPlace.getKakaoPlaceId();
                        log.info("▶ 1차 검색 성공(실존 장소 매칭 완료): {} -> [Lat: {}, Lng: {}]", exactPlaceName, latitude, longitude);
                    } else {
                        // 2차 재시도: 장소명 단독 검색, 정제된 지역 검증 포함
                        log.warn("▶ 1차 검색 실패. 장소명 단독으로 재시도합니다: {}", aiPlace.placeName);
                        List<PlaceResponse> retryPlaces = placeService.searchPlaces(aiPlace.placeName, addressTarget);

                        if (retryPlaces != null && !retryPlaces.isEmpty()) {
                            PlaceResponse exactPlace = retryPlaces.get(0);

                            exactPlaceName = exactPlace.getPlaceName();
                            exactAddress = exactPlace.getAddress();
                            latitude = exactPlace.getLatitude();
                            longitude = exactPlace.getLongitude();
                            kakaoPlaceId = exactPlace.getKakaoPlaceId();
                            log.info("▶ 2차 재시도 성공(실존 장소 매칭 완료): {} -> [Lat: {}, Lng: {}]", exactPlaceName, latitude, longitude);
                        } else {
                            log.error("▶ [위험] '{}' 지역 내에서 매칭 실패. 유령 장소로 판명되어 일정에서 제외합니다: {}", addressTarget, aiPlace.placeName);
                        }
                    }
                }

                // 카카오 API 검색 실패로 좌표를 얻지 못한 유령 장소라면 DB 저장 단계를 패스하고 다음 루프로 스킵!
                if (latitude == null || longitude == null) {
                    continue;
                }

                lastLatitude = latitude;
                lastLongitude = longitude;

                SchedulePlace place = SchedulePlace.builder()
                        .daySchedule(daySchedule)
                        .placeOrder(realPlaceOrder++)
                        .placeName(exactPlaceName)
                        .placeCategory(aiPlace.placeCategory)
                        .address(exactAddress)
                        .latitude(latitude)
                        .longitude(longitude)
                        .kakaoPlaceId(kakaoPlaceId)
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
    private String callGroqApi(TripRequest request, int days, String displayDestination, String addressTarget) {
        RestTemplate restTemplate = new RestTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(groqApiKey);

        // 💡 주소 보정이 끝난 정제된 인자들을 사용하도록 변경
        String prompt = buildPrompt(request, days, displayDestination, addressTarget);

        Map<String, Object> body = new HashMap<>();
        body.put("model", "llama-3.3-70b-versatile");
        body.put("temperature", 0.5);
        body.put("max_tokens", 4096);

        Map<String, Object> message = new HashMap<>();
        message.put("role", "user");
        message.put("content", prompt);
        body.put("messages", List.of(message));

        Map<String, Object> responseFormat = new HashMap<>();
        responseFormat.put("type", "json_object");
        body.put("response_format", responseFormat);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        ResponseEntity<String> response = restTemplate.postForEntity(GROQ_URL, entity, String.class);
        return response.getBody();
    }

    // 프롬프트 생성 (정제된 목적지 및 핵심어 포맷터 매핑)
    private String buildPrompt(TripRequest request, int days, String displayDestination, String addressTarget) {
        String prompt = String.format("""
당신은 여행 플래너 AI입니다.
아래 조건으로 여행 일정을 JSON 형식으로만 반환하세요. 다른 텍스트는 절대 포함하지 마세요.

[여행 정보]
- 목적지: %s
- 기간: %d일
- 예산: %,d원
- 여행 스타일: %s
- 인원: %d명
- 추가 요청: %s

⚠️⚠️⚠️ 가장 중요한 규칙 (최우선으로 반드시 지켜주세요) ⚠️⚠️⚠️
- 모든 장소는 반드시 '%s' 지역 안에 실제로 존재하는 곳이어야 합니다.
- 모든 장소의 address(주소)는 반드시 '%s'(이 지역명 또는 행정구역명) 단어를 포함해야 합니다. (예: 제주도 여행인 경우 '제주특별자치도' 또는 '제주'가 포함되어야 함)
- 절대로 다른 시/도, 다른 도시의 장소를 추천하면 안 됩니다.
- 장소명이 비슷하거나 유명해도 목적지 지역에 없는 곳이면 절대 추천하지 마세요.

⚠️⚠️⚠️ 전체 경로 작성 규칙 ⚠️⚠️⚠️
- 사용자가 여행의 전체 경로를 한눈에 파악할 수 있도록, 1일차부터 %d일차까지의 일정을 누락 없이 작성해야 합니다. 특정 일차에 편중되거나 중간 일정을 생략하는 것을 엄격히 금지합니다.

⚠️⚠️⚠️ 가상의 장소 절대 금지 및 검색어 최적화 (근본적 해결책) ⚠️⚠️⚠️
- 상호명을 절대 임의로 지어내지 마세요.
- 반환하는 모든 'placeName'은 카카오맵(Kakao Map)에 검색했을 때 명확하게 식별 가능한 정식 명칭이거나, [지역명 + 카테고리/특징] 형태의 명확한 검색어 키워드여야 합니다.
  * 허용되는 키워드 예시: "함덕 오션뷰 카페", "동문시장 갈치조림 맛집", "협재 흑돼지 전문점"
- 위와 같이 올바른 키워드 형식이나 실존 상호를 적어주면, 시스템이 카카오 API를 통해 실제 운영 중인 매장의 정확한 이름과 좌표로 덮어씌워 보정할 것입니다.
- 해당 지역 내에 장소가 부족하다면 억지로 채우지 말고 하루 일정을 2~3개로 줄여서 정직하게 반환하세요.

[여행 스타일별 장소 구성 가이드 - 반드시 스타일에 맞게 구성하세요]
- RELAXED (여유로운): 카페, 산책로, 힐링 스팟 위주. 무리한 이동 없이 여유롭게 구성
- ACTIVE (액티브): 등산, 스포츠, 체험 활동 위주. 활동적인 장소로 구성
- CULTURAL (문화탐방): 박물관, 유적지, 역사 명소 위주로 구성
- FOOD (맛집탐방): 유명 맛집, 현지 음식, 카페 위주. 하루 일정의 절반 이상을 음식점/카페로 채우고 해당 지역 유명 음식을 반드시 포함하세요
- NATURE (자연힐링): 자연경관, 해변, 공원, 산 위주로 구성
현재 여행 스타일은 '%s' 입니다. 이 스타일에 철저히 맞게 장소를 구성해주세요.

[반환할 JSON 형식]
{
  "title": "여행 제목",
  "schedules": [
    {
      "dayNumber": 1,
      "theme": "1일차 테마",
      "places": [
        {
          "placeName": "장소명 또는 카카오검색어용 키워드",
          "placeCategory": "카테고리(관광명소/음식점/카페/해변 등)",
          "address": "주소 (반드시 '%s' 포함)",
          "visitTime": "09:00",
          "duration": 120,
          "estimatedCost": 5000,
          "description": "장소 설명"
            }
          ]
        }
      ]
    }
  ]
}

[일정 규칙]
- 하루 3~5개 장소 추천
- duration은 분 단위 숫자
- visitTime은 HH:mm 형식
- 반드시 '%s' 지역 내에 있는 장소만 추천하세요. 인근 도시나 타 지역 장소는 절대 포함하지 마세요.

[estimatedCost 가격 책정 가이드 - 1인 기준, 반드시 지켜주세요]
※ 음식점/카페/시장은 절대 0원 불가. 공원/해변/산책로만 0원 가능.

■ 관광지
- 무료 (공원, 해변, 산책로): 0원
- 유료 입장료 (성산일출봉 등): 실제 입장료 기준

■ 식당 (카테고리 정확히 구분해서 가격 적용)
- 카페/음료: 6,000 ~ 10,000원
- 분식/패스트푸드: 7,000 ~ 12,000원
- 한식 일반 (백반, 국밥): 9,000 ~ 15,000원
- Market 음식: 10,000 ~ 20,000원
- 일식/해산물: 15,000 ~ 40,000원
- 고기류 (삼겹살/갈비/흑돼지): 20,000 ~ 40,000원
- 양식 (파스타, 스테이크): 20,000 ~ 50,000원

※ 숙박은 estimatedCost에 포함하지 마세요
""",
                displayDestination,
                days,
                request.getBudget(),
                request.getTravelStyle(),
                request.getCompanions(),
                request.getPreferences() != null ? request.getPreferences() : "없음",
                displayDestination,
                addressTarget,
                days,
                request.getTravelStyle(),
                addressTarget,
                displayDestination
        );
        System.out.println("=== 생성된 프롬프트 ===");
        System.out.println(prompt);
        System.out.println("=== 프롬프트 끝 ===");

        return prompt;
    }

    // Groq 응답 파싱
    private AiPlanResult parseAiResponse(String rawResponse, String destination, int days) {
        try {
            JsonNode root = objectMapper.readTree(rawResponse);

            String jsonText = root
                    .path("choices").get(0)
                    .path("message")
                    .path("content")
                    .asText();

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