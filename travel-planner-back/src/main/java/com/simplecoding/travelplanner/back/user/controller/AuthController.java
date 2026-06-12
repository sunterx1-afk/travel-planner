package com.simplecoding.travelplanner.back.user.controller;



import com.simplecoding.travelplanner.back.user.dto.request.LoginRequest;
import com.simplecoding.travelplanner.back.user.dto.request.RegisterRequest;
import com.simplecoding.travelplanner.back.user.dto.response.AuthResponse;
import com.simplecoding.travelplanner.back.user.service.AuthService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

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

    // 로그아웃
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        // 💡 maxAge(0)을 주어 즉시 만료시킵니다.
        ResponseCookie cookie = ResponseCookie.from("accessToken", null)
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(0) // 👈 핵심: 만료 시간을 0으로 설정
                .sameSite("Lax")
                .build();

        response.setHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        return ResponseEntity.ok("로그아웃 성공");
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
}
