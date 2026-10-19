package com.CollegeTravel.chat_service.controller;

import com.CollegeTravel.chat_service.client.MembershipVerifier;
import com.CollegeTravel.chat_service.dto.Request.ChatMessageRequest;
import com.CollegeTravel.chat_service.dto.Response.ChatMessageResponse;
import com.CollegeTravel.chat_service.enitiy.ChatMessage;
import com.CollegeTravel.chat_service.exception.BaseApiException;
import com.CollegeTravel.chat_service.exception.NotGroupMemberException;
import com.CollegeTravel.chat_service.repository.ChatMessageRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.handler.annotation.MessageExceptionHandler;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;
import java.util.prefs.BackingStoreException;

@Controller
@RequiredArgsConstructor
public class ChatController {
    private  final ChatMessageRepository chatMessageRepository;
    private  final SimpMessagingTemplate messagingTemplate;
    private final MembershipVerifier membershipVerifier;
    private static final Logger log = LoggerFactory.getLogger(ChatController.class);

    @MessageMapping("/chat.sendMessage")
    public  void sendMessage(@Valid @Payload ChatMessageRequest request, SimpMessageHeaderAccessor headerAccessor){


        Long senderId =(Long) headerAccessor.getSessionAttributes().get("userId");
        String token = (String) headerAccessor.getSessionAttributes().get("jwtToken");

        if (!membershipVerifier.isMember(request.groupId(), senderId, token)) {
            throw new NotGroupMemberException("You are not a member of this group");
        }
        ChatMessage message = new ChatMessage();
        message.setGroupId(request.groupId());
        message.setSenderId(senderId);
        message.setSenderName(request.senderName()!=null? request.senderName(): "User" + senderId);
        message.setContent(request.content());
        ChatMessage saved = chatMessageRepository.save(message);
        messagingTemplate.convertAndSend("/topic/group." + request.groupId(),
                new ChatMessageResponse(saved.getId(), saved.getGroupId(), saved.getSenderId(), saved.getSenderName(), saved.getContent(), saved.getSendAt()));
    }
    @MessageExceptionHandler
    @SendToUser("/queue/errors")
    public String handleException(BaseApiException ex) {
        log.warn("Chat error: {}", ex.getMessage());
        return ex.getMessage();
    }

    @MessageExceptionHandler
    @SendToUser("/queue/errors")
    public String handleUnexpectedException(Exception ex) {
        log.error("Unexpected chat error", ex);
        return "Something went wrong. Please try again.";
    }


}
