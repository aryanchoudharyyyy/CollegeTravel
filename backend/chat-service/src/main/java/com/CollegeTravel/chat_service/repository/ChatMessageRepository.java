package com.CollegeTravel.chat_service.repository;

import com.CollegeTravel.chat_service.enitiy.ChatMessage;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;

public interface ChatMessageRepository  extends JpaRepository<ChatMessage, Long> {
    @Query("""
    SELECT m
    FROM ChatMessage m 
    WHERE m.groupId = :groupId
    ORDER BY m.sendAt DESC, m.id DESC 
""")
    List<ChatMessage> findLatestHistory(@Param("groupId") Long groupId, Pageable pageable);
    @Query("""
        SELECT m
        FROM ChatMessage m
        WHERE m.groupId = :groupId
        AND (
         
         m.sendAt < :cursorTime
        OR (m.sendAt = :cursorTime AND m.id < :cursorId)
        )
        ORDER BY m.sendAt DESC , m.id DESC 
""")
    List<ChatMessage> findHistoryBefore(
            @Param("groupId") Long groupId,
            @Param("cursorTime") LocalDateTime cursorTime,
            @Param("cursorId") Long cursorId,
            Pageable pageable


    );
    List<ChatMessage> findByGroupIdOrderBySendAtAsc(Long groupId);
}
