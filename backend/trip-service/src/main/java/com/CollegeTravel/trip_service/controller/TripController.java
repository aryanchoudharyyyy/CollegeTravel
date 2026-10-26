package com.CollegeTravel.trip_service.controller;

import com.CollegeTravel.trip_service.dto.Response.ExploreTripResponse;
import com.CollegeTravel.trip_service.dto.Response.MatchedTripResponse;
import com.CollegeTravel.trip_service.dto.Response.TripCreationResponse;
import com.CollegeTravel.trip_service.dto.Request.CreateTripRequest;
import com.CollegeTravel.trip_service.entity.Trip;
import com.CollegeTravel.trip_service.service.TripService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.ws.rs.Path;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController()
@RequestMapping("/api/trips")
@RequiredArgsConstructor
public class TripController {
    private static final int MAX_PAGE_SIZE = 100;
    private final TripService tripService;
    @PostMapping
    public TripCreationResponse postTrip(@Valid @RequestBody CreateTripRequest tripRequest, HttpServletRequest request){
        Long userId = (Long) request.getAttribute("userId");
        Trip trip = new Trip();
        trip.setUserId(userId);
        trip.setSourcePoint(tripRequest.sourcePoint());
        trip.setBoardingStation(tripRequest.boardingStation());
        trip.setDestination(tripRequest.destination());
        trip.setVehicleNumber(tripRequest.vehicleNumber());
        trip.setTravelDateTime(tripRequest.travelDateTime());
        return  tripService.postTrip(trip);
    }
    @GetMapping("/{tripId}/matches")
    public Page<MatchedTripResponse> getMatches(@PathVariable Long tripId, HttpServletRequest request,
            @PageableDefault(size = 20, sort = "id", direction = Sort.Direction.DESC) Pageable pageable){
        Long userId = (Long) request.getAttribute("userId");
        return tripService.findMatches(tripId, userId, bounded(pageable));
    }
    @GetMapping("/explore")
    public Page<ExploreTripResponse> getExploreTrips(HttpServletRequest request,
            @PageableDefault(size = 20, sort = "id", direction = Sort.Direction.DESC) Pageable pageable){
        Long userId = (Long) request.getAttribute("userId");
        return tripService.getExploreTrips(userId, bounded(pageable));
    }

    @GetMapping("/my-trips")
    public Page<Trip> getMyTrips(HttpServletRequest request,
            @PageableDefault(size = 20, sort = "id", direction = Sort.Direction.DESC) Pageable pageable){
        Long userId = (Long) request.getAttribute("userId");
        return tripService.getMyTrips(userId, bounded(pageable));
    }

    @GetMapping("/{tripId}")
    public ExploreTripResponse getTrip(@PathVariable Long tripId) {
        return tripService.getExploreTrip(tripId);
    }

    @DeleteMapping("/{tripId}")
    public ResponseEntity<String> deleteTrip(@PathVariable Long tripId, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        tripService.deleteTrip(tripId, userId);
        return ResponseEntity.ok("Trip deleted successfully");
    }

    private Pageable bounded(Pageable pageable) {
        int pageSize = Math.min(pageable.getPageSize(), MAX_PAGE_SIZE);
        Sort sort = pageable.getSort();
        if (sort.getOrderFor("id") == null) sort = sort.and(Sort.by(Sort.Direction.DESC, "id"));
        return PageRequest.of(pageable.getPageNumber(), pageSize, sort);
    }

}
