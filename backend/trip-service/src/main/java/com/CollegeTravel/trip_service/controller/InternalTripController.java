package com.CollegeTravel.trip_service.controller;

import com.CollegeTravel.trip_service.service.TripService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/internal/trips")
@RequiredArgsConstructor
public class InternalTripController {
    private final TripService tripService;
    @GetMapping("/user-has-matching-trip")
    public boolean userHasMatchingTrip(@RequestParam Long userId, @RequestParam String sourcePoint,
                                       @RequestParam String boardingStation, @RequestParam LocalDate travelDate){
        return  tripService.userHasMatchingTrip(userId,sourcePoint,boardingStation,travelDate);

    }
}
