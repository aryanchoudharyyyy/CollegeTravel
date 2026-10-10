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
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController()
@RequestMapping("/api/trips")
@RequiredArgsConstructor
public class TripController {
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
    public List<MatchedTripResponse> getMatches(@PathVariable Long tripId, HttpServletRequest request){
        Long userId = (Long) request.getAttribute("userId");
        return tripService.findMatches(tripId, userId);
    }
    @GetMapping("/explore")
    public List<ExploreTripResponse> getExploreTrips(HttpServletRequest request){
        Long userId = (Long) request.getAttribute("userId");
        return tripService.getExploreTrips(userId);
    }



}
