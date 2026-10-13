package com.CollegeTravel.chat_service.dto.Response;

import java.time.LocalDateTime;

public record ChatMessageResponse(Long id, Long groupId, Long senderId, String senderName, String content, LocalDateTime sendAt) {
}
