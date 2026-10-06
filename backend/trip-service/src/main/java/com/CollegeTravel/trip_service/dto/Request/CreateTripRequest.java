package com.CollegeTravel.trip_service.dto.Request;

import com.CollegeTravel.trip_service.enumm.TravelMode;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public record CreateTripRequest(
        @NotBlank @Size(max = 150) String sourcePoint,
        @NotBlank @Size(max = 150) String boardingStation,
        @Size(max = 150) String destination,
        @Size(max = 50) String vehicleNumber,
        @NotNull @Future LocalDateTime travelDateTime
) {
}
