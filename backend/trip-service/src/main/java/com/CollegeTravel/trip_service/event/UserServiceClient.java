package com.CollegeTravel.trip_service.event;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;
import java.util.Map;

@FeignClient(name = "user-service", contextId = "userServiceClientEvent")
public interface UserServiceClient {
    @GetMapping("/api/users/{userId}/email")
    String getEmailByUserId(@PathVariable("userId") Long userId);
    @GetMapping("/api/internal/users/batch-emails")
    Map<Long, String> getEmailsByUserIds(@RequestParam("ids") List<Long> ids);

}
