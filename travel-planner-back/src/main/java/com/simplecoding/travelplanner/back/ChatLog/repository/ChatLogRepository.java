package com.simplecoding.travelplanner.back.ChatLog.repository;

import com.simplecoding.travelplanner.back.ChatLog.entity.ChatLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ChatLogRepository extends JpaRepository<ChatLog, Long> {
    // 💡 최근 대화 10개를 시간 순으로 정렬해서 가져오는 쿼리 메서드
    List<ChatLog> findTop10ByUserIdOrderByCreatedAtAsc(Long userId);
}