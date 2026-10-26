package com.CollegeTravel.chat_service.service;

import com.CollegeTravel.chat_service.dto.Response.ListingConversationResponse;
import com.CollegeTravel.chat_service.enitiy.ListingConversation;
import com.CollegeTravel.chat_service.enitiy.ListingMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ListingConversationService {
    ListingConversation getOrCreateConversation(Long listingId, Long requestingUserId);
    void verifyAccess(Long conversationId, Long userId);
    List<ListingMessage> getMessages(Long conversationId,Long userId);
    Page<ListingConversationResponse> getUserConversation(Long userId, Pageable pageable);


}
