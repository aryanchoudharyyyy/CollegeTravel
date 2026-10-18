package com.CollegeTravel.chat_service.controller;

import com.CollegeTravel.chat_service.dto.Response.ListingConversationResponse;
import com.CollegeTravel.chat_service.dto.Response.ListingMessageResponse;
import com.CollegeTravel.chat_service.dto.Response.MessageHistoryPage;
import com.CollegeTravel.chat_service.enitiy.ListingConversation;
import com.CollegeTravel.chat_service.enitiy.ListingMessage;
import com.CollegeTravel.chat_service.pagination.MessageCursor;
import com.CollegeTravel.chat_service.pagination.MessageCursorCodec;
import com.CollegeTravel.chat_service.repository.ListingMessageRepository;
import com.CollegeTravel.chat_service.service.ListingConversationService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/chat/listing-conversations")
@RequiredArgsConstructor
public class ListingConversationController {
    private static final int DEFAULT_LIMIT = 50;
    private static final int MAX_LIMIT = 100;

    private final ListingMessageRepository messageRepository;
    private final MessageCursorCodec cursorCodec;
    private  final ListingConversationService conversationService;

    @PostMapping("/start")
    public ListingConversation startConversation(@RequestParam Long listingId, HttpServletRequest request){
        return conversationService.getOrCreateConversation(listingId,(Long) request.getAttribute("userId"));

    }
    @GetMapping("/{conversationId}/history")
    public MessageHistoryPage<ListingMessageResponse> getHistory(
            @PathVariable Long conversationId,
            @RequestParam(required = false) String before,
            @RequestParam(defaultValue = "50") int limit,
            HttpServletRequest request
    ) {
        Long userId = (Long) request.getAttribute("userId");

        // Pehle authorization, phir database query.
        conversationService.verifyAccess(conversationId, userId);

        int safeLimit = Math.min(Math.max(limit, 1), MAX_LIMIT);

        MessageCursor cursor = before == null
                ? null
                : cursorCodec.decode(before);

        List<ListingMessage> fetchedMessages = (cursor == null)
                ? messageRepository.findLatestHistory(
                conversationId,
                PageRequest.of(0, safeLimit + 1)
        )
                : messageRepository.findHistoryBefore(
                conversationId,
                cursor.timestamp(),
                cursor.id(),
                PageRequest.of(0, safeLimit + 1)
        );

        boolean hasMore = fetchedMessages.size() > safeLimit;

        List<ListingMessage> pageMessages = new ArrayList<>(
                hasMore
                        ? fetchedMessages.subList(0, safeLimit)
                        : fetchedMessages
        );

        Collections.reverse(pageMessages);

        String nextCursor = null;

        if (hasMore && !pageMessages.isEmpty()) {
            ListingMessage oldestMessage = pageMessages.getFirst();

            nextCursor = cursorCodec.encode(
                    oldestMessage.getSentAt(),
                    oldestMessage.getId()
            );
        }

        List<ListingMessageResponse> responseMessages = pageMessages.stream()
                .map(message -> new ListingMessageResponse(
                        message.getId(),
                        message.getConversationId(),
                        message.getSenderId(),
                        message.getContent(),
                        message.getSentAt()
                ))
                .toList();

        return new MessageHistoryPage<>(
                responseMessages,
                nextCursor,
                hasMore
        );
    }
    @GetMapping("/mine")
    public List<ListingConversationResponse> getMyConversation(HttpServletRequest request){
        Long userId = (Long) request.getAttribute("userId");
        return conversationService.getUserConversation(userId);
    }

}
