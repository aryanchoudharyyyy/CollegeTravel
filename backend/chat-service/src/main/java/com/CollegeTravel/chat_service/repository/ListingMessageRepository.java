package com.CollegeTravel.chat_service.repository;

import com.CollegeTravel.chat_service.enitiy.ListingMessage;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ListingMessageRepository extends JpaRepository<ListingMessage, Long> {

    @Query("""
    SELECT m
    FROM ListingMessage m
    WHERE m.conversationId = :conversationId
    ORDER BY m.sentAt DESC, m.id DESC
    """)
    List<ListingMessage> findLatestHistory(
            @Param("conversationId") Long conversationId,
            Pageable pageable
    );

    @Query("""
    SELECT m
    FROM ListingMessage m
    WHERE m.conversationId = :conversationId
      AND (
            m.sentAt < :cursorTime
            OR (m.sentAt = :cursorTime AND m.id < :cursorId)
      )
    ORDER BY m.sentAt DESC, m.id DESC
    """)
    List<ListingMessage> findHistoryBefore(
            @Param("conversationId") Long conversationId,
            @Param("cursorTime") LocalDateTime cursorTime,
            @Param("cursorId") Long cursorId,
            Pageable pageable
    );

    List<ListingMessage> findByConversationIdOrderBySentAtAsc(Long conversationId);

    Optional<ListingMessage> findTopByConversationIdOrderBySentAtDesc(Long conversationId);
}