package com.simplecoding.travelplanner.back.ChatLog.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ChatResponse {
    // AI가 최종적으로 유저에게 건넬 대화체 답변 본문
    private String reply;
}