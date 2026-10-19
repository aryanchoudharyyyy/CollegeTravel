package com.CollegeTravel.chat_service.security;

import com.CollegeTravel.chat_service.client.MembershipVerifier;
import com.CollegeTravel.chat_service.service.ListingConversationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.stereotype.Component;

import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class WebSocketSubscriptionInterceptor implements ChannelInterceptor {
    private final MembershipVerifier membershipVerifier;
    private final ListingConversationService listingConversationService;
    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel){
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (accessor != null && StompCommand.SUBSCRIBE.equals(accessor.getCommand())){
            String destination = accessor.getDestination();
            Map<String, Object> sessionAttrs = accessor.getSessionAttributes();
            Long userId = sessionAttrs != null ? (Long) sessionAttrs.get("userId") : null;
            if (destination == null){
                throw new IllegalArgumentException("Subscription missing a destination");
            }
            if (destination.startsWith("/user/") || destination.startsWith("/queue/")) {
                return message;
            }
            if (userId == null) {
                log.warn("Subscription rejected for unauthenticated session to destination: {}", destination);
                throw new IllegalArgumentException("User is not authenticated");
            }

            if (destination.startsWith("/topic/group.")) {
                Long groupId = Long.parseLong(destination.substring("/topic/group.".length()));
                String token = (String) sessionAttrs.get("jwtToken");
                if (!membershipVerifier.isMember(groupId, userId, token)) {
                    log.warn("User {} denied subscription to squad group {}", userId, groupId);
                    throw new IllegalArgumentException("Not authorized to subscribe to this group");
                }

            } else if (destination.startsWith("/topic/listing-conversation.")) {
                Long conversationId = Long.parseLong(destination.substring("/topic/listing-conversation.".length()));
                try {
                    listingConversationService.verifyAccess(conversationId, userId);
                } catch (Exception ex) {
                    log.warn("User {} denied subscription to listing conversation {}: {}", userId, conversationId, ex.getMessage());
                    throw ex;
                }
            } else {
                log.warn("User {} attempted subscription to unauthorized destination: {}", userId, destination);
                throw new IllegalArgumentException("Unknown or unauthorized subscription destination: " + destination);
            }
        }
        return message;
    }


}
