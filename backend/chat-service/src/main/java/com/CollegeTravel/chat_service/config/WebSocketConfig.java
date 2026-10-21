package com.CollegeTravel.chat_service.config;

import com.CollegeTravel.chat_service.security.WebSocketAuthInterceptor;
import com.CollegeTravel.chat_service.security.WebSocketSubscriptionInterceptor;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.context.annotation.Bean;
import org.springframework.messaging.Message;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.web.socket.messaging.StompSubProtocolErrorHandler;

import java.nio.charset.StandardCharsets;

@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    private final WebSocketAuthInterceptor webSocketAuthInterceptor;
    private final WebSocketSubscriptionInterceptor webSocketSubscriptionInterceptor;
    @Value("${FRONTEND_ORIGIN:http://localhost:5173}")
    private String frontendOrigin;
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry){
        // Modern Native WebSocket endpoint (Solves the Vite crash!)
        registry.addEndpoint("/api/chat/ws")
                .setAllowedOrigins(frontendOrigin);

        // Fallback with SockJS just in case
        registry.addEndpoint("/api/chat/ws")
                .setAllowedOrigins(frontendOrigin)
                .withSockJS();

        registry.setErrorHandler(stompErrorHandler());
    }

    @Bean
    public StompSubProtocolErrorHandler stompErrorHandler() {
        return new StompSubProtocolErrorHandler() {
            @Override
            public Message<byte[]> handleClientMessageProcessingError(Message<byte[]> clientMessage, Throwable ex) {
                Throwable cause = ex;
                while (cause.getCause() != null && cause.getCause() != cause) {
                    cause = cause.getCause();
                }
                String message = cause.getMessage() != null ? cause.getMessage() : "WebSocket processing error";

                StompHeaderAccessor accessor = StompHeaderAccessor.create(StompCommand.ERROR);
                accessor.setMessage(message);
                accessor.setLeaveMutable(true);
                return MessageBuilder.createMessage(message.getBytes(StandardCharsets.UTF_8), accessor.getMessageHeaders());
            }
        };
    }



    @Override
    public  void configureMessageBroker(MessageBrokerRegistry registry){
        registry.enableSimpleBroker("/topic", "/queue");
        registry.setApplicationDestinationPrefixes("/app");
    }
    @Override
    public void configureClientInboundChannel(ChannelRegistration registration){
        registration.interceptors(webSocketAuthInterceptor, webSocketSubscriptionInterceptor);
    }

}
