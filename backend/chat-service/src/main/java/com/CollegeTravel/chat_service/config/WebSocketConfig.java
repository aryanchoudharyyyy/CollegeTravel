package com.CollegeTravel.chat_service.config;

import com.CollegeTravel.chat_service.security.WebSocketAuthInterceptor;
import com.CollegeTravel.chat_service.security.WebSocketSubscriptionInterceptor;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    private final WebSocketAuthInterceptor webSocketAuthInterceptor;
    private final WebSocketSubscriptionInterceptor webSocketSubscriptionInterceptor;
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry){
        // Modern Native WebSocket endpoint (Solves the Vite crash!)
        registry.addEndpoint("/api/chat/ws")
                .setAllowedOriginPatterns("*");

        // Fallback with SockJS just in case
        registry.addEndpoint("/api/chat/ws")
                .setAllowedOriginPatterns("*")
                .withSockJS();
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
