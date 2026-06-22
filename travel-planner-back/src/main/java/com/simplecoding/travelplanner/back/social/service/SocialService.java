package com.simplecoding.travelplanner.back.social.service;

import com.simplecoding.travelplanner.back.user.entity.User;
import com.simplecoding.travelplanner.back.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SocialService {

    private final UserRepository userRepository;

    @Transactional
    public User getOrCreateKakaoUser(String email) {
        // 컨트롤러에서 가상 이메일을 문자열 1개로 받아오므로 파라미터는 (String email) 하나면 됩니다.
        return userRepository.findByEmail(email)
                .orElseGet(() -> {
                    User newUser = User.builder()
                            .email(email)
                            .password("KAKAO_USER")
                            .nickname("카카오유저_" + System.currentTimeMillis())
                            .role("ROLE_USER")
                            .build();
                    return userRepository.save(newUser);
                });
    }
}