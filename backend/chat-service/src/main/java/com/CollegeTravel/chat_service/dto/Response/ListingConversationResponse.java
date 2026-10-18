package com.CollegeTravel.chat_service.dto.Response;

import java.time.LocalDateTime;

public record ListingConversationResponse(Long conversationId, Long listingId, Long otherUserId, String otherUserName, String lastMessage, LocalDateTime lastMessageTime) {
}
