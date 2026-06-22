package com.simplecoding.travelplanner.back.ChatLog.controller;

import com.simplecoding.travelplanner.back.ChatLog.dto.ChatRequest;
import com.simplecoding.travelplanner.back.ChatLog.dto.ChatResponse;
import com.simplecoding.travelplanner.back.ChatLog.service.ChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/ai/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    /**
     * AI 여행 가이드 챗봇 대화 API
     * * @param userId  로그인된 사용자의 고유 ID PK (기존 프로젝트 인증 방식에 맞게 어노테이션 변경 가능)
     * @param request 유저 입력 메시지 및 현재 화면의 추천 장소 동선 리스트(선택)
     */
    @PostMapping
    public ResponseEntity<ChatResponse> sendMessageToChatbot(
            @RequestBody ChatRequest request) { // 💡 @RequestAttribute 제거

        // 💡 SecurityContext에서 인증된 유저 ID를 안전하게 가져옵니다.
        Long userId = (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        log.info("[챗봇 요청 수신] User ID: {}, Message: {}", userId, request.getMessage());

        String aiReply = chatService.askToAiChatbot(userId, request);
        return ResponseEntity.ok(new ChatResponse(aiReply));
    }
}