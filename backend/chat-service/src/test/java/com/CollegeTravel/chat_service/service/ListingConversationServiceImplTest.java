package com.CollegeTravel.chat_service.service;

import com.CollegeTravel.chat_service.client.MarketplaceLookupClient;
import com.CollegeTravel.chat_service.client.UserLookupClient;
import com.CollegeTravel.chat_service.enitiy.ListingConversation;
import com.CollegeTravel.chat_service.exception.ConversationNotFoundException;
import com.CollegeTravel.chat_service.exception.NotConversationParticipantException;
import com.CollegeTravel.chat_service.repository.ListingConversationRepository;
import com.CollegeTravel.chat_service.repository.ListingMessageRepository;
import com.CollegeTravel.chat_service.serviceImpl.ListingConversationServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ListingConversationServiceImplTest {

    @Mock
    private ListingConversationRepository conversationRepository;

    @Mock
    private ListingMessageRepository messageRepository;

    @Mock
    private MarketplaceLookupClient marketplaceLookupClient;

    @Mock
    private UserLookupClient userLookupClient;

    @InjectMocks
    private ListingConversationServiceImpl conversationService;

    @Test
    void verifyAccess_whenBuyer_succeeds() {
        ListingConversation conv = new ListingConversation();
        conv.setId(2L);
        conv.setListingId(10L);
        conv.setBuyerId(101L);
        conv.setSellerId(202L);

        when(conversationRepository.findById(2L)).thenReturn(Optional.of(conv));

        assertDoesNotThrow(() -> conversationService.verifyAccess(2L, 101L));
        verifyNoInteractions(marketplaceLookupClient);
    }

    @Test
    void verifyAccess_whenSeller_succeedsWithoutExternalCall() {
        ListingConversation conv = new ListingConversation();
        conv.setId(2L);
        conv.setListingId(10L);
        conv.setBuyerId(101L);
        conv.setSellerId(202L);

        when(conversationRepository.findById(2L)).thenReturn(Optional.of(conv));

        assertDoesNotThrow(() -> conversationService.verifyAccess(2L, 202L));
        verifyNoInteractions(marketplaceLookupClient);
    }

    @Test
    void verifyAccess_whenNeitherBuyerNorSeller_throwsNotConversationParticipantException() {
        ListingConversation conv = new ListingConversation();
        conv.setId(2L);
        conv.setListingId(10L);
        conv.setBuyerId(101L);
        conv.setSellerId(202L);

        when(conversationRepository.findById(2L)).thenReturn(Optional.of(conv));

        assertThrows(NotConversationParticipantException.class, () ->
                conversationService.verifyAccess(2L, 999L));
        verifyNoInteractions(marketplaceLookupClient);
    }

    @Test
    void verifyAccess_whenConversationNotFound_throwsConversationNotFoundException() {
        when(conversationRepository.findById(2L)).thenReturn(Optional.empty());

        assertThrows(ConversationNotFoundException.class, () ->
                conversationService.verifyAccess(2L, 101L));
    }

    @Test
    void verifyAccess_whenUserIdNull_throwsNotConversationParticipantException() {
        assertThrows(NotConversationParticipantException.class, () ->
                conversationService.verifyAccess(2L, null));
        verifyNoInteractions(conversationRepository);
    }
}
