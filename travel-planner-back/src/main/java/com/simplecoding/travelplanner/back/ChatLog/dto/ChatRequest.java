package com.simplecoding.travelplanner.back.ChatLog.dto;

import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Getter
@Setter
public class ChatRequest {
    // 유저가 채팅창에 직접 타이핑한 메시지 (예: "방금 일정 버스 노선이랑 요금 알려줘")
    private String message;

    // 🚀 [핵심 비밀 무기] 방금 생성되어 화면에 띄워진 장소 이름 리스트를 리액트가 몰래 팩킹해서 보냅니다.
    // 예: ["구룡포 대게집", "죽도시장", "영일대 오션뷰 카페"]
    private List<String> currentPlanPlaces;
    private int day;
}