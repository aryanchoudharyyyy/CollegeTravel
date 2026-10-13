package com.CollegeTravel.chat_service.controller;
import com.CollegeTravel.chat_service.client.MembershipVerifier;
import com.CollegeTravel.chat_service.dto.Response.ChatMessageResponse;
import com.CollegeTravel.chat_service.dto.Response.MessageHistoryPage;
import com.CollegeTravel.chat_service.enitiy.ChatMessage;
import com.CollegeTravel.chat_service.exception.NotGroupMemberException;
import com.CollegeTravel.chat_service.pagination.MessageCursor;
import com.CollegeTravel.chat_service.pagination.MessageCursorCodec;
import com.CollegeTravel.chat_service.repository.ChatMessageRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatHistoryController {
    private static final int DEFAULT_LIMIT = 50;
    private static final int MAX_LIMIT = 100;
    private final MembershipVerifier membershipVerifier;
    private final ChatMessageRepository chatMessageRepository;
    private final MessageCursorCodec cursorCodec;
    @GetMapping("/group/{groupId}/history")
    public MessageHistoryPage<ChatMessageResponse> getHistory(@PathVariable Long groupId,
                                                              @RequestParam(required = false) String before,
                                                              @RequestParam(defaultValue = "50") int limit,
                                                              HttpServletRequest request){
        Long userId =(Long) request.getAttribute("userId");
        String token = request.getHeader("Authorization");
        if(!membershipVerifier.isMember(groupId,userId,token)){
            throw  new NotGroupMemberException("You are not a member of this group ");
        }
        int safeLimit = Math.min(Math.max(limit, 1),MAX_LIMIT);
        MessageCursor cursor = before == null ? null : cursorCodec.decode(before);
        List<ChatMessage> fetchedMessages = (cursor == null) ? chatMessageRepository.findLatestHistory(
                groupId,
                PageRequest.of(0, safeLimit+1)

        ):
                chatMessageRepository.findHistoryBefore(
                        groupId,
                        cursor.timestamp(),
                        cursor.id(),
                        PageRequest.of(0, safeLimit+1)
                );
        boolean hasMore = fetchedMessages.size() > safeLimit;
        List<ChatMessage> pageMessages = new ArrayList<>(
                hasMore
                        ?fetchedMessages.subList(0,safeLimit): fetchedMessages
        );
        Collections.reverse(pageMessages);
        String nextCursor = null;
        if (hasMore && !pageMessages.isEmpty()){
            ChatMessage oldestMessage = pageMessages.getFirst();
            nextCursor = cursorCodec.encode(
                    oldestMessage.getSendAt(),
                    oldestMessage.getId()
            );
        }
        List<ChatMessageResponse> responseMessages = pageMessages.stream()
                .map(message -> new ChatMessageResponse(
                        message.getId(),
                        message.getGroupId(),
                        message.getSenderId(),
                        message.getSenderName(),
                        message.getContent(),
                        message.getSendAt()
                ))
                .toList();

        return new MessageHistoryPage<>(
                responseMessages,
                nextCursor,
                hasMore
        );
    }
}
