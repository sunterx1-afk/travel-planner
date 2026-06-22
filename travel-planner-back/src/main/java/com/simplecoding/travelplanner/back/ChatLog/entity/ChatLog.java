package com.simplecoding.travelplanner.back.ChatLog.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "CHAT_LOGS")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class ChatLog {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "chat_seq")
    @SequenceGenerator(name = "chat_seq", sequenceName = "CHAT_SEQ", allocationSize = 1)
    @Column(name = "CHAT_ID")
    private Long chatId;

    @Column(name = "USER_ID", nullable = false)
    private Long userId;

    @Column(name = "ROLE", nullable = false, length = 50)
    private String role; // "user" 또는 "assistant"

    @Column(name = "CONTENT", nullable = false, length = 4000)
    private String content;

    @Column(name = "CREATED_AT", nullable = false)
    private LocalDateTime createdAt;
}