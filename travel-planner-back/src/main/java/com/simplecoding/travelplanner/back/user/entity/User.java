package com.simplecoding.travelplanner.back.user.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "USERS")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    // 💡 1. 실수로 지워졌던 고유 ID(PK) 필드를 올바르게 복구했습니다!
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "users_seq")
    @SequenceGenerator(name = "users_seq", sequenceName = "USERS_SEQ", allocationSize = 1)
    @Column(name = "USER_ID")
    private Long userId;

    // 💡 2. 변경하신 이메일 허용(nullable = true) 설정
    @Column(name = "EMAIL", nullable = true, unique = true, length = 100)
    private String email;

    @Column(name = "PASSWORD", nullable = false, length = 255)
    private String password;

    @Column(name = "NICKNAME", nullable = false, length = 50)
    private String nickname;

    @Column(name = "ROLE", length = 20)
    private String role;

    // 💡 3. 변경하신 소셜 로그인 정보 저장 필드 2개
    @Column(name = "PROVIDER", length = 20)
    private String provider;

    @Column(name = "PROVIDER_ID", length = 50)
    private String providerId;

    // 💡 4. 함께 지워졌던 가입일자 필드도 안전하게 복구했습니다!
    @CreationTimestamp
    @Column(name = "CREATED_AT", updatable = false)
    private LocalDateTime createdAt;
}