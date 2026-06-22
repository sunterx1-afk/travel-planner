package com.simplecoding.travelplanner.back.user.service;

import com.simplecoding.travelplanner.back.auth.entity.RefreshToken;
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
import com.simplecoding.travelplanner.back.auth.entity.RefreshToken;
import com.simplecoding.travelplanner.back.auth.repository.RefreshTokenRepository;

import java.nio.charset.StandardCharsets;

@Service
@RequiredArgsConstructor
public class AuthService {

    // 💡 수정 완료: 중복 선언된 userRepository 제거됨
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final RefreshTokenRepository refreshTokenRepository;

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

    @Transactional
    public AuthResponse login(LoginRequest request, HttpServletResponse response) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("이메일 또는 비밀번호가 올바르지 않아요."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("이메일 또는 비밀번호가 올바르지 않아요.");
        }

        // 3. 토큰 생성
        String accessToken = jwtUtil.generateToken(user.getUserId(), user.getEmail());
        String refreshToken = jwtUtil.generateRefreshToken(user.getEmail()); // Refresh Token 생성

        // 4. Redis에 Refresh Token 저장
        refreshTokenRepository.save(RefreshToken.builder()
                .email(user.getEmail())
                .refreshToken(refreshToken)
                .build());


// 5. 쿠키에 Access Token 및 Refresh Token 저장
        Cookie accessCookie = new Cookie("accessToken", accessToken);
        accessCookie.setHttpOnly(true);
        accessCookie.setSecure(true);
        accessCookie.setPath("/");
        response.addCookie(accessCookie);

// 💡 추가된 부분: Refresh Token도 쿠키로 만들어서 응답 헤더에 추가합니다.
ResponseCookie refreshCookie = ResponseCookie.from("refreshToken", refreshToken)
        .httpOnly(true)
        .path("/")
        .sameSite("Lax")
        .build();

response.addHeader(HttpHeaders.SET_COOKIE, refreshCookie.toString());


        return AuthResponse.builder()
                .userId(user.getUserId())
                .email(user.getEmail())
                .nickname(user.getNickname())
                .message("로그인이 완료됐어요.")
                .build();
    }

    public void logout(HttpServletResponse response, String email) {
        // 1. accessToken 삭제용 쿠키
        ResponseCookie accessCookie = ResponseCookie.from("accessToken", null)
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(0)
                .build();

        // 2. refreshToken 삭제용 쿠키
        ResponseCookie refreshCookie = ResponseCookie.from("refreshToken", null)
                .httpOnly(true)
                .path("/")
                .maxAge(0)
                .build();

        // 3. 두 쿠키를 응답 헤더에 추가 (setHeader 대신 addHeader 사용)
        response.addHeader(HttpHeaders.SET_COOKIE, accessCookie.toString());
        response.addHeader(HttpHeaders.SET_COOKIE, refreshCookie.toString());

        // 4. Redis 데이터 삭제 (이 부분이 중요!)
        if (email != null) {
            refreshTokenRepository.deleteById(email);
        }
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

    public void saveTokensToCookie(HttpServletResponse response, String accessToken, String refreshToken) {
        // Access Token 쿠키 설정
        Cookie accessCookie = new Cookie("accessToken", accessToken);
        accessCookie.setHttpOnly(true);   // 자바스크립트에서 접근 불가 (보안)
        accessCookie.setSecure(true);     // https에서만 동작 (로컬 테스트 시에는 false 가능)
        accessCookie.setPath("/");        // 모든 경로에서 쿠키 접근 가능

        // Refresh Token 쿠키 설정
        Cookie refreshCookie = new Cookie("refreshToken", refreshToken);
        refreshCookie.setHttpOnly(true);
        refreshCookie.setSecure(true);
        refreshCookie.setPath("/");

        // 응답에 쿠키 추가
        response.addCookie(accessCookie);
        response.addCookie(refreshCookie);
    }
}