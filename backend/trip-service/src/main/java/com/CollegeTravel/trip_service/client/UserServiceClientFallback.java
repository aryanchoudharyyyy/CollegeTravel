package com.CollegeTravel.trip_service.client;

import com.CollegeTravel.trip_service.dto.Response.UserSummaryDTO;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
@Component
public class UserServiceClientFallback implements UserServiceClient{
    @Override
    public List<UserSummaryDTO> getUsersByIds(List<Long> ids){
        return Collections.emptyList();
    }

}
