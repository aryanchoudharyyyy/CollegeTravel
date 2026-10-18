package com.CollegeTravel.chat_service.service;

import com.CollegeTravel.chat_service.dto.Response.ListingConversationResponse;
import com.CollegeTravel.chat_service.enitiy.ListingConversation;
import com.CollegeTravel.chat_service.enitiy.ListingMessage;

import java.util.List;

public interface ListingConversationService {
    ListingConversation getOrCreateConversation(Long listingId, Long requestingUserId);
    void verifyAccess(Long conversationId, Long userId);
    List<ListingMessage> getMessages(Long conversationId,Long userId);
    List<ListingConversationResponse> getUserConversation(Long userId);


}
