//package com.simplecoding.travelplanner.back.config;
//
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.web.cors.CorsConfiguration;
//import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
//import org.springframework.web.filter.CorsFilter;
//
//@Configuration
//public class CorsConfig {
//
//    @Bean
//    public CorsFilter corsFilter() {
//        CorsConfiguration config = new CorsConfiguration();
//
//        // 쿠키 전송 허용 (중요!)
//        config.setAllowCredentials(true);
//
//        // 프론트 주소 허용
//        config.addAllowedOrigin("http://localhost:5173");
//
//        // 모든 헤더 허용
//        config.addAllowedHeader("*");
//
//        // 모든 메서드 허용
//        config.addAllowedMethod("*");
//
//        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
//        source.registerCorsConfiguration("/api/**", config);
//
//        return new CorsFilter(source);
//    }
//}