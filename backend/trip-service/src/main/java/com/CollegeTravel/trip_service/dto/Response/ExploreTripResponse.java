package com.CollegeTravel.trip_service.dto.Response;

import com.CollegeTravel.trip_service.entity.Trip;

public record ExploreTripResponse(Trip trip, String postedBy) {
}
