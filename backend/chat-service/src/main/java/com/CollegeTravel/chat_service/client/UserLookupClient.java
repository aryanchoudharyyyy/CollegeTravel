package com.CollegeTravel.chat_service.client;

import com.CollegeTravel.chat_service.dto.Response.UserSummaryDTO;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class UserLookupClient {
    private final UserServiceClient userServiceClient;

    @Retry(name = "user-service")
    @CircuitBreaker(name = "user-service", fallbackMethod = "fallback")
    public List<UserSummaryDTO> getUserByIds(List<Long> ids) {
        if (ids == null || ids.isEmpty()) return Collections.emptyList();
        return userServiceClient.getUserByIds(ids);
    }

    private List<UserSummaryDTO> fallback(List<Long> ids, Throwable t) {
        log.warn("Failed to fetch user details from user-service for ids {}: {}", ids, t.getMessage());
        return Collections.emptyList();
    }
}