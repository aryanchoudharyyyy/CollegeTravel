package com.CollegeTravel.chat_service.dto.Request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ChatMessageRequest(
        @NotNull Long groupId,
        @NotBlank @Size(max = 1000) String content,
        String senderName
) {
}
