package com.CollegeTravel.chat_service.security;

import com.CollegeTravel.chat_service.client.GroupServiceClient;
import com.CollegeTravel.chat_service.service.ListingConversationService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class WebSocketAuthInterceptor implements ChannelInterceptor {
    @Value("${jwt.secret}")
    private String secret;
    private final GroupServiceClient groupServiceClient;
    private final ListingConversationService listingConversationService;
    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel){
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);



        if(accessor!=null && StompCommand.CONNECT.equals(accessor.getCommand())){
            String authHeader = accessor.getFirstNativeHeader("Authorization");
            
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                throw new IllegalArgumentException("Missing or invalid Authorization header");
            }
            try {
                SecretKey key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
                Claims claims = Jwts.parser().verifyWith(key).build()
                        .parseSignedClaims(authHeader.substring(7)).getPayload();
                Number userIdRaw = claims.get("userId", Number.class);
                accessor.setUser(() -> String.valueOf(userIdRaw));
                Map<String, Object> sessionAttrs = accessor.getSessionAttributes();
                if (sessionAttrs == null) {
                    sessionAttrs = new java.util.HashMap<>();
                    accessor.setSessionAttributes(sessionAttrs);
                }
                sessionAttrs.put("userId", userIdRaw != null ? userIdRaw.longValue() : null);
                sessionAttrs.put("jwtToken", authHeader);
            } catch (Exception e) {
                throw new IllegalArgumentException("Invalid or expired token");
            }
        }
        /*
         * SUBSCRIBE
         */
        if (StompCommand.SUBSCRIBE.equals(accessor.getCommand())) {

            String destination = accessor.getDestination();

            if (destination == null) {
                return message;
            }

            Long userId = (Long)
                    accessor.getSessionAttributes()
                            .get("userId");

            String token = (String)
                    accessor.getSessionAttributes()
                            .get("jwtToken");

            if (destination.startsWith("/topic/group.")) {

                Long groupId = Long.parseLong(
                        destination.replace(
                                "/topic/group.",
                                ""
                        )
                );


                boolean isMember =
                        groupServiceClient.isMember(
                                groupId,
                                userId,
                                token
                        );

                if (!isMember) {
                    throw new IllegalArgumentException(
                            "Access denied"
                    );
                }
            }

            if (destination.startsWith(
                    "/topic/listing-conversation."
            )) {

                Long conversationId = Long.parseLong(
                        destination.replace(
                                "/topic/listing-conversation.",
                                ""
                        )
                );

                listingConversationService.verifyAccess(
                        conversationId,
                        userId
                );
            }
        }
        return  message;
    }
}
