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
import org.springframework.web.util.UriComponentsBuilder;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class PlaceService {

    private final PlaceCacheRepository placeCacheRepository;
    private final ObjectMapper objectMapper;

    @Value("${kakao.api.key:}")
    private String kakaoApiKey;

    private static final String KAKAO_SEARCH_URL =
            "https://dapi.kakao.com/v2/local/search/keyword.json";

    // 💡 기존 호출부와의 호환을 위해 유지 (지역 검증 없는 기본 검색)
    @Transactional
    public List<PlaceResponse> searchPlaces(String keyword) {
        return searchPlaces(keyword, null);
    }

    /**
     * 장소 검색 (캐시 우선 → 없으면 카카오 API 호출)
     * @param keyword 검색 키워드
     * @param regionFilter null이 아니면, 주소에 이 지역명이 포함된 결과만 반환 (캐시/API 공통 적용)
     */
    @Transactional
    public List<PlaceResponse> searchPlaces(String keyword, String regionFilter) {

        // 1. 캐시에서 먼저 검색
        List<PlaceCache> cached = placeCacheRepository
                .findByPlaceNameContainingIgnoreCase(keyword);

        if (!cached.isEmpty()) {
            List<PlaceResponse> cachedResults = cached.stream()
                    .map(PlaceResponse::fromCache)
                    .toList();

            List<PlaceResponse> filtered = filterByRegion(cachedResults, regionFilter);

            if (!filtered.isEmpty()) {
                log.info("캐시에서 장소 반환 (지역 검증 통과): keyword={}, count={}", keyword, filtered.size());
                return filtered;
            } else if (regionFilter != null) {
                // 💡 캐시는 있지만 지역이 안 맞으면 캐시 무시하고 카카오 API로 재검색
                log.warn("캐시 결과가 지역({})과 불일치하여 무시하고 API 재검색: keyword={}", regionFilter, keyword);
            }
        }

        // 2. 캐시 없거나 지역 불일치 -> 카카오 API 호출
        if (kakaoApiKey == null || kakaoApiKey.isBlank()) {
            log.warn("카카오 API 키가 없어요. 빈 결과 반환");
            return new ArrayList<>();
        }

        List<PlaceResponse> apiResults = searchFromKakao(keyword);
        return filterByRegion(apiResults, regionFilter);
    }

    // 💡 주소에 지역명이 포함된 결과만 필터링 (regionFilter가 null이면 전체 반환)
    private List<PlaceResponse> filterByRegion(List<PlaceResponse> results, String regionFilter) {
        if (regionFilter == null || regionFilter.isBlank()) {
            return results;
        }
        return results.stream()
                .filter(p -> p.getAddress() != null && p.getAddress().contains(regionFilter))
                .toList();
    }

    // 카카오 로컬 API 호출
    private List<PlaceResponse> searchFromKakao(String keyword) {
        try {
            RestTemplate restTemplate = new RestTemplate();

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "KakaoAK " + kakaoApiKey);

            HttpEntity<Void> entity = new HttpEntity<>(headers);

            String url = UriComponentsBuilder.fromHttpUrl(KAKAO_SEARCH_URL)
                    .queryParam("query", keyword)
                    .queryParam("size", 15) // 💡 후보를 더 많이 받아서 지역 필터링 여지를 늘림
                    .build()
                    .toUriString();

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