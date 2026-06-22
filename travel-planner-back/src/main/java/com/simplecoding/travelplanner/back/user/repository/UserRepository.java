package com.simplecoding.travelplanner.back.user.repository;

import com.simplecoding.travelplanner.back.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    boolean existsByNickname(String nickname);

    // 💡 소셜 플랫폼 종류와 고유 식별 ID로 유저를 찾는 메서드 추가
    Optional<User> findByProviderAndProviderId(String provider, String providerId);
}