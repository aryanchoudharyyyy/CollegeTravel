package com.CollegeTravel.user_service.dto.Request;

public record UpdateProfileRequest(String name, String year, String college, String location, String graduationYear) {
}
