package com.CollegeTravel.chat_service.serviceImpl;

import com.CollegeTravel.chat_service.client.MarketplaceLookupClient;
import com.CollegeTravel.chat_service.dto.Response.ListingConversationResponse;
import com.CollegeTravel.chat_service.enitiy.ListingConversation;
import com.CollegeTravel.chat_service.enitiy.ListingMessage;
import com.CollegeTravel.chat_service.exception.CannotMessageOwnListingException;
import com.CollegeTravel.chat_service.exception.ConversationNotFoundException;
import com.CollegeTravel.chat_service.exception.NotConversationParticipantException;
import com.CollegeTravel.chat_service.repository.ListingConversationRepository;
import com.CollegeTravel.chat_service.repository.ListingMessageRepository;
import com.CollegeTravel.chat_service.service.ListingConversationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ListingConversationServiceImpl implements ListingConversationService {
    private final ListingConversationRepository conversationRepository;
    private final ListingMessageRepository messageRepository;
    private final MarketplaceLookupClient marketplaceLookupClient;
    @Override
    @Transactional
    public ListingConversation getOrCreateConversation(Long listingId, Long requestingUserId) {
        Long ownerId = marketplaceLookupClient.getListingOwner(listingId);
        if (ownerId.equals(requestingUserId)){
            throw  new CannotMessageOwnListingException("You cannot start a conversation about your own listing");
        }
        
        java.util.Optional<ListingConversation> existing = conversationRepository.findByListingIdAndBuyerId(listingId, requestingUserId);
        if (existing.isPresent()) {
            return existing.get();
        }

        ListingConversation c = new ListingConversation();
        c.setListingId(listingId);
        c.setBuyerId(requestingUserId);
        c.setSellerId(ownerId);
        
        try {
            return conversationRepository.save(c);
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            return conversationRepository.findByListingIdAndBuyerId(listingId, requestingUserId)
                    .orElseThrow(() -> new IllegalStateException("Conversation could not be fetched after duplicate creation attempt", e));
        }
    }

    @Override
    public void verifyAccess(Long conversationId, Long userId) {
    ListingConversation conversation =conversationRepository.findById(conversationId)
            .orElseThrow(()->new ConversationNotFoundException("Conversation not found: "+conversationId));
    if (conversation.getBuyerId().equals(userId)) return;
    Long ownerId = marketplaceLookupClient.getListingOwner(conversation.getListingId());
    if (ownerId.equals(userId)) return;
    throw new NotConversationParticipantException("You are not part of this conversation");
    }

    @Override
    public List<ListingMessage> getMessages(Long conversationId, Long userId) {
        verifyAccess(conversationId,userId);
        return messageRepository.findByConversationIdOrderBySentAtAsc(conversationId);
    }

    @Override
    public List<ListingConversationResponse> getUserConversation(Long userId) {
        List<ListingConversation> list = conversationRepository.findByBuyerIdOrSellerIdOrderByStartedAtDesc(userId, userId);
        return list.stream().map(c -> {
            Long otherUserId = c.getBuyerId().equals(userId) ? c.getSellerId() : c.getBuyerId();
            Optional<ListingMessage> lastMsg = messageRepository.findTopByConversationIdOrderBySentAtDesc(c.getId());
           String lastText = lastMsg.map(ListingMessage::getContent).orElse("Chat started");
            LocalDateTime lastTime = lastMsg.map(ListingMessage::getSentAt).orElse(c.getStartedAt());
            return new ListingConversationResponse(
                    c.getId(),
                    c.getListingId(),
                    otherUserId,
                    otherUserId != null ? "User #" + otherUserId : "User",
                    lastText,
                    lastTime
            );
        }).toList();

    }
}




