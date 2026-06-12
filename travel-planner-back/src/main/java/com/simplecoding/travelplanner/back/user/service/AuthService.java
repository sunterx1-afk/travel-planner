package com.simplecoding.travelplanner.back.user.service;

import com.simplecoding.travelplanner.back.config.JwtUtil;
import com.simplecoding.travelplanner.back.user.dto.request.LoginRequest;
import com.simplecoding.travelplanner.back.user.dto.request.RegisterRequest;
import com.simplecoding.travelplanner.back.user.dto.response.AuthResponse;
import com.simplecoding.travelplanner.back.user.entity.User;
import com.simplecoding.travelplanner.back.user.repository.UserRepository;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;

@Service
@RequiredArgsConstructor
public class AuthService {

    // 💡 수정 완료: 중복 선언된 userRepository 제거됨
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Value("${jwt.secret}")
    private String jwtSecret;

    // 회원가입
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("이미 사용 중인 이메일이에요.");
        }
        if (userRepository.existsByNickname(request.getNickname())) {
            throw new IllegalArgumentException("이미 사용 중인 닉네임이에요.");
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .nickname(request.getNickname())
                .build();

        userRepository.save(user);

        return AuthResponse.builder()
                .userId(user.getUserId())
                .email(user.getEmail())
                .nickname(user.getNickname())
                .message("회원가입이 완료됐어요.")
                .build();
    }

    // 로그인
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request, HttpServletResponse response) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("이메일 또는 비밀번호가 올바르지 않아요."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("이메일 또는 비밀번호가 올바르지 않아요.");
        }

        // JWT 생성
        String token = jwtUtil.generateToken(user.getUserId(), user.getEmail());

        // HttpOnly 쿠키에 저장
        Cookie cookie = new Cookie("accessToken", token);
        cookie.setHttpOnly(true);
        cookie.setSecure(false);
        cookie.setPath("/");
        cookie.setMaxAge(-1);
        response.addCookie(cookie);

        return AuthResponse.builder()
                .userId(user.getUserId())
                .email(user.getEmail())
                .nickname(user.getNickname())
                .message("로그인이 완료됐어요.")
                .build();
    }

    // 로그아웃
    public void logout(HttpServletResponse response) {
        // 1. SameSite 설정과 만료 시간(0)을 명시한 쿠키 생성
        ResponseCookie cookie = ResponseCookie.from("accessToken", null)
                .httpOnly(true)
                .secure(false) // 로컬 개발 환경용, HTTPS라면 true
                .path("/")
                .maxAge(0)     // 💡 중요: 0으로 설정하여 즉시 삭제
                .sameSite("Lax") // 💡 중요: 브라우저 보안 정책 대응
                .build();

        // 2. 응답 헤더에 직접 Set-Cookie 추가
        response.setHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    /**
     * 토큰을 검증하고 현재 로그인한 유저 정보를 반환하는 메서드
     */
    public AuthResponse getCurrentUserByToken(String token) {
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8)))
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

            String email = claims.get("email", String.class);

            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 유저입니다."));

            // 💡 수정 완료: Setter 대신 Builder 사용, user.getId() 대신 user.getUserId() 사용
            return AuthResponse.builder()
                    .userId(user.getUserId())
                    .email(user.getEmail())
                    .nickname(user.getNickname())
                    .message("인증에 성공했습니다.")
                    .build();

        } catch (Exception e) {
            throw new IllegalArgumentException("유효하지 않거나 만료된 토큰입니다.");
        }
    }
}