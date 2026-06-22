package com.simplecoding.travelplanner.back.config;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private long expiration;

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    // 토큰 생성 (액세스 토큰 - email을 claim으로 저장)
    public String generateToken(Long userId, String email) {
        return Jwts.builder()
                .setSubject(String.valueOf(userId))
                .claim("email", email)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // 토큰에서 userId 추출 (액세스 토큰 전용 - subject가 userId임)
    public Long getUserIdFromToken(String token) {
        return Long.parseLong(getClaims(token).getSubject());
    }

    // 토큰에서 email 추출 (액세스 토큰 전용 - claim에 email이 있음)
    public String getEmailFromToken(String token) {
        return (String) getClaims(token).get("email");
    }

    // 💡 리프레시 토큰에서 email 추출 (리프레시 토큰은 subject에 email이 들어있음!)
    public String getEmailFromRefreshToken(String token) {
        return getClaims(token).getSubject();
    }

    // 토큰 유효성 검사
    public boolean validateToken(String token) {
        try {
            getClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    private Claims getClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    // 리프레시 토큰 생성 (subject에 email 저장, email claim은 없음)
    public String generateRefreshToken(String email) {
        long refreshTokenExpiration = 14 * 24 * 60 * 60 * 1000L; // 14일 (밀리초)

        return Jwts.builder()
                .setSubject(email)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + refreshTokenExpiration))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String createAccessToken(Long userId, String email) {
        return generateToken(userId, email);
    }
}