package com.CollegeTravel.trip_service.dto.Response;

import com.CollegeTravel.trip_service.entity.Trip;

import java.util.List;

public record TripCreationResponse(Trip myTrip, List<MatchedTripResponse> immediateMatches, boolean hasMoreImmediateMatches) {
}
