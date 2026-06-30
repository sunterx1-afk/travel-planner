package com.simplecoding.travelplanner.back.user.controller;



import com.simplecoding.travelplanner.back.auth.entity.RefreshToken;
import com.simplecoding.travelplanner.back.auth.repository.RefreshTokenRepository;
import com.simplecoding.travelplanner.back.config.JwtUtil;
import com.simplecoding.travelplanner.back.social.dto.SocialLoginRequest;
import com.simplecoding.travelplanner.back.social.service.KakaoService;
import com.simplecoding.travelplanner.back.social.service.SocialService;
import com.simplecoding.travelplanner.back.user.dto.request.LoginRequest;
import com.simplecoding.travelplanner.back.user.dto.request.RegisterRequest;
import com.simplecoding.travelplanner.back.user.dto.response.AuthResponse;
import com.simplecoding.travelplanner.back.user.entity.User;
import com.simplecoding.travelplanner.back.user.service.AuthService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.simplecoding.travelplanner.back.user.repository.UserRepository;


@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final JwtUtil jwtUtil;
    private final RefreshTokenRepository refreshTokenRepository;
    private final UserRepository userRepository;
    private final KakaoService kakaoService;       // 외부 API 통신용
    private final SocialService socialService;

    // 회원가입
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(response);
    }

    // 로그인
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request,
                                              HttpServletResponse response) {
        AuthResponse authResponse = authService.login(request, response);
        return ResponseEntity.ok(authResponse);
    }

    // 로그아웃 (Refresh Token 삭제 추가)
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request, HttpServletResponse response) {
        // 1. 쿠키에서 accessToken 추출 (또는 헤더에서 추출)
        String accessToken = resolveToken(request); // 쿠키에서 토큰을 찾아내는 별도 메서드 활용

        if (accessToken != null) {
            // 2. 토큰에서 이메일 추출
            String email = jwtUtil.getEmailFromToken(accessToken);

            // 3. Redis에서 삭제
            authService.logout(response, email);
        } else {
            // 토큰이 없어도 로그아웃은 수행 (쿠키 비우기)
            authService.logout(response, null);
        }

        return ResponseEntity.ok("로그아웃 성공");
    }

    // 💡 쿠키에서 accessToken을 찾는 헬퍼 메서드 예시
    private String resolveToken(HttpServletRequest request) {
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("accessToken".equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }

    // 토큰 재발급 API (리프레시 토큰 로테이션 적용)
    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@CookieValue(name = "refreshToken", required = false) String refreshToken,
                                     HttpServletResponse response) {

        if (refreshToken == null || !jwtUtil.validateToken(refreshToken)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Refresh Token 만료");
        }

        // 💡 리프레시 토큰은 subject에 email이 들어있음 (claim이 아님)
        String email = jwtUtil.getEmailFromRefreshToken(refreshToken);
        RefreshToken storedToken = refreshTokenRepository.findById(email).orElse(null);

        // 💡 Redis에 저장된 값과 클라이언트가 보낸 토큰이 정확히 일치하는지 검증
        // (다르면 -> 이미 사용되어 폐기된 토큰일 가능성, 즉 탈취 의심 상황)
        if (storedToken == null || !storedToken.getRefreshToken().equals(refreshToken)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("유효하지 않은 Refresh Token");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("유저를 찾을 수 없습니다."));

        // 새 Access Token 발급
        String newAccessToken = jwtUtil.generateToken(user.getUserId(), email);

        // 💡 [로테이션] 새 Refresh Token도 같이 발급하고, 기존 값을 즉시 덮어씀
        String newRefreshToken = jwtUtil.generateRefreshToken(email);
        refreshTokenRepository.save(RefreshToken.builder()
                .email(email)
                .refreshToken(newRefreshToken)
                .build());

        // 새 Access Token 쿠키 설정 (세션 쿠키 - 브라우저 종료 시 삭제)
        ResponseCookie newAccessCookie = ResponseCookie.from("accessToken", newAccessToken)
                .httpOnly(true)
                .secure(true)
                .path("/")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, newAccessCookie.toString());

        // 💡 [로테이션] 새 Refresh Token 쿠키도 갱신 (기존 쿠키를 새 값으로 덮어씀)
        ResponseCookie newRefreshCookie = ResponseCookie.from("refreshToken", newRefreshToken)
                .httpOnly(true)
                .secure(true)
                .path("/")
                .sameSite("Lax")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, newRefreshCookie.toString());

        return ResponseEntity.ok("재발급 성공");
    }

    // AuthController.java에 추가
    @GetMapping("/me")
    public ResponseEntity<AuthResponse> getCurrentUser(
            @CookieValue(name = "accessToken", required = false) String token) {

        // 쿠키에 토큰이 없거나 유효하지 않으면 401 Unauthorized 상태를 반환하게 해야 합니다.
        if (token == null || token.isEmpty()) {
            return ResponseEntity.status(401).build();
        }

        // 토큰을 해석해서 유저 정보를 가져오는 서비스 로직 호출
        AuthResponse response = authService.getCurrentUserByToken(token);
        return ResponseEntity.ok(response);
    }


    @PostMapping("/kakao")
    public ResponseEntity<?> kakaoLogin(@RequestBody SocialLoginRequest request, HttpServletResponse response) {
        String kakaoAccessToken = kakaoService.getKakaoAccessToken(request.code());
        String email = kakaoService.getKakaoEmail(kakaoAccessToken);

        // 1. 여기서 user 정보를 받아옵니다.
        User user = socialService.getOrCreateKakaoUser(email);

        // 2. 이제 user.getUserId()를 활용해 토큰을 생성합니다.
        String jwtAccess = jwtUtil.createAccessToken(user.getUserId(), email);
        String jwtRefresh = jwtUtil.generateRefreshToken(email);

        authService.saveTokensToCookie(response, jwtAccess, jwtRefresh);
        refreshTokenRepository.save(new RefreshToken(email, jwtRefresh));

        return ResponseEntity.ok("카카오 로그인 성공");
    }


}
