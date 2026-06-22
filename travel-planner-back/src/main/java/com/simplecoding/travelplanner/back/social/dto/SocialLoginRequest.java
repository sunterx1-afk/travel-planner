package com.simplecoding.travelplanner.back.social.dto;

/**
 * 프론트엔드 -> 백엔드: 카카오 인가 코드 전달 객체
 */
public record SocialLoginRequest(String code) {
}