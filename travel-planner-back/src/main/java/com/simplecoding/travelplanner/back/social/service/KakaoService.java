package com.simplecoding.travelplanner.back.social.service;

import com.simplecoding.travelplanner.back.social.dto.KakaoTokenResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class KakaoService {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${kakao.client-id}") private String clientId;
    @Value("${kakao.client-secret}") private String clientSecret;
    @Value("${kakao.redirect-uri}") private String redirectUri;

    // 카카오 액세스 토큰 획득
    public String getKakaoAccessToken(String code) {
        String url = "https://kauth.kakao.com/oauth/token";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("grant_type", "authorization_code");
        params.add("client_id", clientId);
        params.add("client_secret", clientSecret);
        params.add("redirect_uri", redirectUri);
        params.add("code", code);

        HttpEntity<MultiValueMap<String, String>> requestEntity = new HttpEntity<>(params, headers);

        KakaoTokenResponse response = restTemplate.postForObject(url, requestEntity, KakaoTokenResponse.class);

        return response.accessToken();
    }

    // 카카오 이메일 조회 (이메일 동의 안 했으면 고유 ID 기반 더미 이메일 반환)
    @SuppressWarnings("unchecked")
    public String getKakaoEmail(String accessToken) {
        String url = "https://kapi.kakao.com/v2/user/me";
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);

        Map<String, Object> response = restTemplate.postForObject(url, new HttpEntity<>(headers), Map.class);

        // 💡 카카오 고유 ID는 email 동의 여부와 관계없이 항상 내려옴
        Object kakaoId = response.get("id");

        Map<String, Object> kakaoAccount = (Map<String, Object>) response.get("kakao_account");
        String email = (kakaoAccount != null) ? (String) kakaoAccount.get("email") : null;

        // 💡 이메일 동의를 안 했거나 이메일이 없는 카카오 계정이면, 고유 ID 기반 더미 이메일로 대체
        if (email == null || email.isBlank()) {
            email = "kakao_" + kakaoId + "@kakao.local";
        }

        return email;
    }
}