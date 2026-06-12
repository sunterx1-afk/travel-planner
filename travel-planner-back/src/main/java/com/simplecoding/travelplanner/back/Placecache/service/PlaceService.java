package com.simplecoding.travelplanner.back.Placecache.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import com.simplecoding.travelplanner.back.Placecache.dto.PlaceResponse;
import com.simplecoding.travelplanner.back.Placecache.entity.PlaceCache;
import com.simplecoding.travelplanner.back.Placecache.repository.PlaceCacheRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class PlaceService {

    private final PlaceCacheRepository placeCacheRepository;
    private final ObjectMapper objectMapper;

    // 💡 카카오 API 키 받으면 application.properties에 추가
    // kakao.api.key=YOUR_KAKAO_REST_API_KEY
    @Value("${kakao.api.key:}")
    private String kakaoApiKey;

    private static final String KAKAO_SEARCH_URL =
            "https://dapi.kakao.com/v2/local/search/keyword.json";

    // 장소 검색 (캐시 우선 → 없으면 카카오 API 호출)
    @Transactional
    public List<PlaceResponse> searchPlaces(String keyword) {

        // 1. 캐시에서 먼저 검색
        List<PlaceCache> cached = placeCacheRepository
                .findByPlaceNameContainingIgnoreCase(keyword);

        if (!cached.isEmpty()) {
            log.info("캐시에서 장소 반환: keyword={}, count={}", keyword, cached.size());
            return cached.stream()
                    .map(PlaceResponse::fromCache)
                    .toList();
        }

        // 2. 캐시 없으면 카카오 API 호출
        // 💡 카카오 API 키 받으면 아래 주석 해제
        if (kakaoApiKey == null || kakaoApiKey.isBlank()) {
            log.warn("카카오 API 키가 없어요. 빈 결과 반환");
            return new ArrayList<>();
        }

        return searchFromKakao(keyword);
    }

    // 카카오 로컬 API 호출
    private List<PlaceResponse> searchFromKakao(String keyword) {
        try {
            RestTemplate restTemplate = new RestTemplate();

            HttpHeaders headers = new HttpHeaders();
            // 💡 카카오 API 키 받으면 아래 주석 해제
            headers.set("Authorization", "KakaoAK " + kakaoApiKey);

            HttpEntity<Void> entity = new HttpEntity<>(headers);

            String url = KAKAO_SEARCH_URL + "?query=" + keyword + "&size=10";

            ResponseEntity<String> response = restTemplate.exchange(
                    url, HttpMethod.GET, entity, String.class);

            return parseAndCacheKakaoResponse(response.getBody());

        } catch (Exception e) {
            log.error("카카오 API 호출 실패: {}", e.getMessage());
            return new ArrayList<>();
        }
    }

    // 카카오 응답 파싱 + 캐시 저장
    private List<PlaceResponse> parseAndCacheKakaoResponse(String rawResponse) {
        List<PlaceResponse> results = new ArrayList<>();

        try {
            JsonNode root = objectMapper.readTree(rawResponse);
            JsonNode documents = root.path("documents");

            for (JsonNode doc : documents) {
                String kakaoPlaceId = doc.path("id").asText();
                String placeName = doc.path("place_name").asText();
                String category = doc.path("category_name").asText();
                String address = doc.path("road_address_name").asText();
                if (address.isBlank()) address = doc.path("address_name").asText();
                double longitude = doc.path("x").asDouble();
                double latitude = doc.path("y").asDouble();

                // 캐시에 없으면 저장
                if (placeCacheRepository.findByKakaoPlaceId(kakaoPlaceId).isEmpty()) {
                    PlaceCache cache = PlaceCache.builder()
                            .kakaoPlaceId(kakaoPlaceId)
                            .placeName(placeName)
                            .category(category)
                            .address(address)
                            .latitude(latitude)
                            .longitude(longitude)
                            .build();
                    placeCacheRepository.save(cache);
                    log.info("장소 캐시 저장: {}", placeName);
                }

                results.add(PlaceResponse.builder()
                        .kakaoPlaceId(kakaoPlaceId)
                        .placeName(placeName)
                        .category(category)
                        .address(address)
                        .latitude(latitude)
                        .longitude(longitude)
                        .fromCache(false)
                        .build());
            }

        } catch (Exception e) {
            log.error("카카오 응답 파싱 실패: {}", e.getMessage());
        }

        return results;
    }
}
