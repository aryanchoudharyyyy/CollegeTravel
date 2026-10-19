package com.CollegeTravel.chat_service.security;

import com.CollegeTravel.chat_service.client.GroupServiceClient;
import com.CollegeTravel.chat_service.client.MembershipVerifier;
import com.CollegeTravel.chat_service.controller.ChatController;
import com.CollegeTravel.chat_service.dto.Request.ChatMessageRequest;
import com.CollegeTravel.chat_service.exception.NotGroupMemberException;
import com.CollegeTravel.chat_service.repository.ChatMessageRepository;
import com.CollegeTravel.chat_service.service.ListingConversationService;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.Message;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.test.util.ReflectionTestUtils;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WebSocketSecurityTest {

    private static final String TEST_SECRET = "superSecretKeyForUnitTestingPurposesOnly1234567890!";

    @Mock
    private GroupServiceClient groupServiceClient;

    @Mock
    private ListingConversationService listingConversationService;

    @Mock
    private MembershipVerifier membershipVerifier;

    @Mock
    private ChatMessageRepository chatMessageRepository;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    private WebSocketAuthInterceptor authInterceptor;
    private WebSocketSubscriptionInterceptor subscriptionInterceptor;
    private ChatController chatController;

    @BeforeEach
    void setUp() {
        authInterceptor = new WebSocketAuthInterceptor(groupServiceClient, listingConversationService);
        ReflectionTestUtils.setField(authInterceptor, "secret", TEST_SECRET);

        subscriptionInterceptor = new WebSocketSubscriptionInterceptor(membershipVerifier, listingConversationService);
        chatController = new ChatController(chatMessageRepository, messagingTemplate, membershipVerifier);
    }

    @Test
    void whenConnectWithDummyToken_shouldThrowException() {
        StompHeaderAccessor accessor = StompHeaderAccessor.create(StompCommand.CONNECT);
        accessor.addNativeHeader("Authorization", "Bearer dummy-jwt-token");
        accessor.addNativeHeader("userId", "101");
        accessor.setSessionAttributes(new HashMap<>());
        Message<?> message = MessageBuilder.createMessage(new byte[0], accessor.getMessageHeaders());

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                authInterceptor.preSend(message, null));
        assertEquals("Invalid or expired token", ex.getMessage());
    }

    @Test
    void whenConnectWithoutAuthHeader_shouldThrowException() {
        StompHeaderAccessor accessor = StompHeaderAccessor.create(StompCommand.CONNECT);
        accessor.setSessionAttributes(new HashMap<>());
        Message<?> message = MessageBuilder.createMessage(new byte[0], accessor.getMessageHeaders());

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                authInterceptor.preSend(message, null));
        assertEquals("Missing or invalid Authorization header", ex.getMessage());
    }

    @Test
    void whenConnectWithValidSignedJwt_shouldAuthenticateSuccessfully() {
        SecretKey key = Keys.hmacShaKeyFor(TEST_SECRET.getBytes(StandardCharsets.UTF_8));
        String validToken = Jwts.builder()
                .claim("userId", 42L)
                .signWith(key)
                .compact();

        StompHeaderAccessor accessor = StompHeaderAccessor.create(StompCommand.CONNECT);
        accessor.setLeaveMutable(true);
        accessor.addNativeHeader("Authorization", "Bearer " + validToken);
        accessor.setSessionAttributes(new HashMap<>());
        Message<?> message = MessageBuilder.createMessage(new byte[0], accessor.getMessageHeaders());

        Message<?> result = authInterceptor.preSend(message, null);
        assertNotNull(result);

        StompHeaderAccessor resultAccessor = StompHeaderAccessor.wrap(result);
        assertEquals(42L, resultAccessor.getSessionAttributes().get("userId"));
        assertEquals("Bearer " + validToken, resultAccessor.getSessionAttributes().get("jwtToken"));
    }

    @Test
    void whenSubscribeToGroup9999WithoutMembership_shouldBeRejected() {
        StompHeaderAccessor accessor = StompHeaderAccessor.create(StompCommand.SUBSCRIBE);
        accessor.setDestination("/topic/group.9999");
        Map<String, Object> sessionAttrs = new HashMap<>();
        sessionAttrs.put("userId", 42L);
        sessionAttrs.put("jwtToken", "Bearer some-token");
        accessor.setSessionAttributes(sessionAttrs);
        Message<?> message = MessageBuilder.createMessage(new byte[0], accessor.getMessageHeaders());

        when(membershipVerifier.isMember(9999L, 42L, "Bearer some-token")).thenReturn(false);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                subscriptionInterceptor.preSend(message, null));
        assertEquals("Not authorized to subscribe to this group", ex.getMessage());
    }

    @Test
    void whenSendMessageToGroup9999WithoutMembership_shouldThrowNotGroupMemberException() {
        ChatMessageRequest request = new ChatMessageRequest(9999L, "Test Sender", "Hello world");

        SimpMessageHeaderAccessor headerAccessor = SimpMessageHeaderAccessor.create();
        headerAccessor.setSessionAttributes(Map.of(
                "userId", 42L,
                "jwtToken", "Bearer some-token"
        ));

        when(membershipVerifier.isMember(9999L, 42L, "Bearer some-token")).thenReturn(false);

        assertThrows(NotGroupMemberException.class, () ->
                chatController.sendMessage(request, headerAccessor));

        verifyNoInteractions(chatMessageRepository);
        verifyNoInteractions(messagingTemplate);
    }
}
