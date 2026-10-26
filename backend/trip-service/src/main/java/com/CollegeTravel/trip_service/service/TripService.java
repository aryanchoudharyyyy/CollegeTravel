package com.CollegeTravel.trip_service.service;

import com.CollegeTravel.trip_service.dto.Response.ExploreTripResponse;
import com.CollegeTravel.trip_service.dto.Response.MatchedTripResponse;
import com.CollegeTravel.trip_service.dto.Response.TripCreationResponse;
import com.CollegeTravel.trip_service.entity.Trip;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;

public interface TripService {
    TripCreationResponse postTrip(Trip trip);
    Page<MatchedTripResponse> findMatches(Long tripId, Long requestingUserId, Pageable pageable);
    boolean userHasMatchingTrip(Long userId, String sourcePoint, String boardingStation, LocalDate travelDate);
    Page<ExploreTripResponse> getExploreTrips(Long userId, Pageable pageable);
    Page<Trip> getMyTrips(Long userId, Pageable pageable);
    ExploreTripResponse getExploreTrip(Long tripId);
    void deleteTrip(Long tripId, Long userId);
}
