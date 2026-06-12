package com.simplecoding.travelplanner.back.auth.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import org.springframework.data.annotation.Id;
import org.springframework.data.redis.core.RedisHash;

@Getter
@Builder
@AllArgsConstructor
@RedisHash(value = "refresh_token", timeToLive = 1209600) // 14일 (초 단위)
public class RefreshToken {

    @Id
    private String email;
    private String refreshToken;
}
