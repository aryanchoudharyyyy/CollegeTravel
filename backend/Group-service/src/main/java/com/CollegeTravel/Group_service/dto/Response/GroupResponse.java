package com.CollegeTravel.Group_service.dto.Response;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record GroupResponse(Long id, String sourcePoint, String boardingStation, LocalDate travelDate, Long createdBy, LocalDateTime createdAt) {
}
