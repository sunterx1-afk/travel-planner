package com.simplecoding.travelplanner.back.auth.repository;

import com.simplecoding.travelplanner.back.auth.entity.RefreshToken;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RefreshTokenRepository extends CrudRepository<RefreshToken, String> {
    // 내용이 여기 딱 하나만 있어야 합니다!
}