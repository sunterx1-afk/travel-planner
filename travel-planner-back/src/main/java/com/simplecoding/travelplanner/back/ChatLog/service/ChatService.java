package com.simplecoding.travelplanner.back.ChatLog.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.simplecoding.travelplanner.back.ChatLog.dto.ChatRequest;
import com.simplecoding.travelplanner.back.ChatLog.entity.ChatLog;
import com.simplecoding.travelplanner.back.ChatLog.repository.ChatLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatLogRepository chatLogRepository;
    private final ObjectMapper objectMapper;

    @Value("${groq.api.key}")
    private String groqApiKey;

    private static final String GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

    @Transactional
    public String askToAiChatbot(Long userId, ChatRequest request) {
        String originalUserMessage = request.getMessage();
        String processedUserMessage = originalUserMessage;

        int currentDay = request.getDay();
        boolean isAllRouteRequested = originalUserMessage.contains("전체") ||
                originalUserMessage.contains("총") ||
                originalUserMessage.contains("모든");

        if (originalUserMessage.contains("1일차") || originalUserMessage.contains("첫째날")) {
            currentDay = 1;
            isAllRouteRequested = false;
        } else if (originalUserMessage.contains("2일차") || originalUserMessage.contains("둘째날")) {
            currentDay = 2;
            isAllRouteRequested = false;
        } else if (originalUserMessage.contains("3일차") || originalUserMessage.contains("셋째날")) {
            currentDay = 3;
            isAllRouteRequested = false;
        }

        // 🚀 1. 일정 장소 리스트 처리
        if (request.getCurrentPlanPlaces() != null && !request.getCurrentPlanPlaces().isEmpty()) {
            List<String> allPlaces = request.getCurrentPlanPlaces();
            List<String> filteredPlaces = new ArrayList<>();
            String planContext = "";

            if (isAllRouteRequested) {
                filteredPlaces = allPlaces;
                planContext = String.format(
                        "\n\n(참고: 사용자가 전체 여행 경로와 총 요금을 요청했습니다.\n"
                                + "전체 방문 장소 리스트: %s\n"
                                + "⚠️ [필수 지침]:\n"
                                + "1. 1일차 장소만 답변하지 말고, 리스트에 있는 모든 일차의 전체 장소를 순서대로 연결하여 전체 동선을 설명하세요.\n"
                                + "2. 이동 수단 추천 시 버스에만 국한하지 마세요. 지하철이 더 빠르거나 환승이 편하다면 지하철 노선을 적극 추천하고, 버스+지하철 환승 경로 또는 도보 동선까지 고려하여 가장 빠르고 편리한 '최적 경로'를 안내하세요.\n"
                                + "3. **[숙소 복귀]** 각 일차별 동선의 맨 처음 장소가 해당 일차의 '출발지이자 최종 복귀 숙소'입니다. 마지막 장소에서 다시 그 첫 번째 장소(숙소)로 돌아가는 복귀 경로와 비용을 전체 동선 흐름의 맨 마지막 단계에 이어서 자연스럽게 한 번만 작성하세요. 절대로 하단에 중복된 단락을 따로 만들지 마세요.)",
                        filteredPlaces.toString()
                );
            } else {
                // 특정 일차 분량 슬라이싱
                int placesPerPage = 4;
                int startIndex = (currentDay - 1) * placesPerPage;
                int endIndex = Math.min(startIndex + placesPerPage, allPlaces.size());

                if (startIndex < allPlaces.size() && startIndex >= 0) {
                    filteredPlaces = allPlaces.subList(startIndex, endIndex);
                } else {
                    filteredPlaces = allPlaces;
                }

                // 💡 현재 렌더링된 리스트의 1번 장소를 명확히 추출하여 AI에게 주입
                String startAccommodation = (!filteredPlaces.isEmpty()) ? filteredPlaces.get(0) : "당일 첫 번째 장소(숙소)";

                planContext = String.format(
                        "\n\n(참고: 사용자가 현재 요청한 여행 일정은 [%d일차] 동선입니다.\n"
                                + "방문 장소 순서: %s\n"
                                + "⚠️ [필수 지침]:\n"
                                + "1. 오늘의 시작점이자 최종 복귀 숙소는 오직 **[%s]** 하나뿐입니다. 과거 대화 기록에 등장한 다른 숙소나 다른 구의 주소는 전부 무시하세요.\n"
                                + "2. 위 장소 리스트 순서대로 이동하되, 동선은 반드시 [ %s ➡️ 중간 관광지들 ➡️ 다시 %s 복귀 ]의 순환 흐름으로만 짜야 합니다.\n"
                                + "3. 대중교통(지하철 호선/환승, 시내버스)과 도보를 조합하여 가장 빠르고 효율적인 최적 경로를 안내하세요.\n"
                                + "4. **[중복 단락 생성 절대 금지]** 마지막 장소에서 %s(으)로 돌아가는 복귀 경로와 비용은 본문 이동 경로 흐름의 맨 마지막 단계에 자연스럽게 이어 붙여서 딱 한 번만 언급하세요. 절대로 답변 하단에 '마지막 관광지에서 숙소로의 복귀 경로' 같은 별도의 타이틀이나 중복 단락을 이중으로 만들지 마세요.)",
                        currentDay, filteredPlaces.toString(), startAccommodation, startAccommodation, startAccommodation, startAccommodation
                );
            }

            processedUserMessage += planContext;
        }

        // 🚀 2. 순수한 유저 질문 원본만 DB에 저장
        ChatLog userLog = ChatLog.builder()
                .userId(userId)
                .role("user")
                .content(originalUserMessage)
                .createdAt(LocalDateTime.now())
                .build();
        chatLogRepository.save(userLog);

        List<ChatLog> history = chatLogRepository.findTop10ByUserIdOrderByCreatedAtAsc(userId);
        List<Map<String, Object>> messages = new ArrayList<>();

        // 🚀 3. 시스템 프롬프트 가이드라인 강화 (순환 구조 완성 및 중복 출력 제어)
        String systemInstruction = "너는 유트립(UTrip)의 스마트 AI 여행 가이드야. "
                + "사용자가 물어본 장소들의 이동 경로, 교통수단, 교통비를 가이드처럼 친절하게 대답해줘. "
                + "🚨 [교통수단 및 출력 규칙]:\n"
                + "1. 버스만 고집하지 말고, 지하철(호선 및 환승역), 시내버스, 도보를 모두 조합한 최적 대중교통 경로를 찾아내야 해.\n"
                + "2. 일정이 끝난 후 '마지막 관광지 ➡️ 당일 첫 번째 장소(숙소)'로 복귀하는 동선과 교통 비용은 전체 경로 리스트 흐름의 맨 마지막 단계를 설명할 때 자연스럽게 한 번만 포함시켜줘.\n"
                + "3. 절대로 답변 하단에 '복귀 경로'라는 대제목이나 단락을 중복해서 따로 분리하여 생성하지 마. 똑같은 숙소 복귀 안내는 한 답변 내에 무조건 딱 한 번만 기술되어야 해.";

        if (!isAllRouteRequested) {
            systemInstruction += String.format(" 오직 제공된 [%d일차] 장소 리스트 안에서만 답변하고 다음 날짜 일정을 임의로 예측하지 마.", currentDay);
        }

        messages.add(Map.of(
                "role", "system",
                "content", systemInstruction
        ));

        for (ChatLog logEntry : history) {
            messages.add(Map.of("role", logEntry.getRole(), "content", logEntry.getContent()));
        }

        messages.add(Map.of("role", "user", "content", processedUserMessage));

        // 🚀 4. Groq API 실시간 호출
        String aiReply = callGroqChatApi(messages);

        // 🚀 5. AI의 답변 내용을 DB에 저장
        ChatLog assistantLog = ChatLog.builder()
                .userId(userId)
                .role("assistant")
                .content(aiReply)
                .createdAt(LocalDateTime.now())
                .build();
        chatLogRepository.save(assistantLog);

        return aiReply;
    }

    private String callGroqChatApi(List<Map<String, Object>> messages) {
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(groqApiKey);

        Map<String, Object> body = new HashMap<>();
        body.put("model", "llama-3.1-8b-instant");
        body.put("messages", messages);
        body.put("temperature", 0.4); // 💡 스리슬쩍 온도를 낮춰 환각(유령 숙소 제조) 현상을 더 억제합니다.
        body.put("max_tokens", 1024);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(GROQ_URL, entity, String.class);
            JsonNode root = objectMapper.readTree(response.getBody());
            return root.path("choices").get(0).path("message").path("content").asText();
        } catch (Exception e) {
            log.error("챗봇 Groq API 호출 실패: {}", e.getMessage());
            return "죄송합니다. 현재 AI 가이드 서버 통신이 원활하지 않습니다. 잠시 후 다시 질문해 주세요!";
        }
    }
}