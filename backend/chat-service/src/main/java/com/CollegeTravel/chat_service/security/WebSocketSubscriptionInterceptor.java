package com.CollegeTravel.chat_service.security;

import com.CollegeTravel.chat_service.client.MembershipVerifier;
import com.CollegeTravel.chat_service.service.ListingConversationService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.stereotype.Component;

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
            Long userId = (Long) accessor.getSessionAttributes().get("userId");
            if (destination==null){
                throw new IllegalArgumentException("Subscription missing a destination");

            }
            else if (destination.equals("/user/queue/errors")){

            } else if (destination.startsWith("/topic/group.")) {
                Long groupId = Long.parseLong(destination.substring("/topic/group.".length()));
                String token = (String) accessor.getSessionAttributes().get("jwtToken");
                if (!membershipVerifier.isMember(groupId, userId, token)) {
                    throw new IllegalArgumentException("Not authorized to subscribe to this group");
                }

            } else if (destination.startsWith("/topic/listing-conversation.")) {
                Long conversationId = Long.parseLong(destination.substring("/topic/listing-conversation.".length()));
                listingConversationService.verifyAccess(conversationId, userId);
                
            }
            else {
                throw  new IllegalArgumentException("Unknown or unauthorized subscription destination");
            }
        }
        return message;
    }


}
