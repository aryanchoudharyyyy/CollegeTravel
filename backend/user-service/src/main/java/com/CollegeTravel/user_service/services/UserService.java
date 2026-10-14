package com.CollegeTravel.user_service.services;

import com.CollegeTravel.user_service.dto.Request.UpdateProfileRequest;
import com.CollegeTravel.user_service.dto.Response.UserSummaryDTO;
import com.CollegeTravel.user_service.entity.User;

import java.util.List;
import java.util.Map;

public interface UserService {


    User getById(Long id);
    User getByCollegeEmail(String collegeEmail);
    List<UserSummaryDTO> getUsersByIds(List<Long> ids);
    Map<Long,String> getEmailsByUserIds(List<Long> userIds);
    User updateProfile(String collegeEmail, UpdateProfileRequest request);
}
