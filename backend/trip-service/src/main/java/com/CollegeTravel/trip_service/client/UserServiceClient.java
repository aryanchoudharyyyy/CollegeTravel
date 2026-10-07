package com.CollegeTravel.trip_service.client;

import com.CollegeTravel.trip_service.dto.Response.UserSummaryDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@FeignClient(name = "user-service", fallback = UserServiceClientFallback.class)
public interface UserServiceClient {
    @GetMapping("/api/internal/users/batch")
    List<UserSummaryDTO> getUsersByIds(@RequestParam("ids") List<Long> ids);
}
