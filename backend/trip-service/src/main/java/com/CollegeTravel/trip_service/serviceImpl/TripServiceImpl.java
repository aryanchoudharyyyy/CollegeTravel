package com.CollegeTravel.trip_service.serviceImpl;

import com.CollegeTravel.trip_service.client.*;
import com.CollegeTravel.trip_service.dto.Response.ExploreTripResponse;
import com.CollegeTravel.trip_service.dto.Response.MatchedTripResponse;
import com.CollegeTravel.trip_service.dto.Response.TripCreationResponse;
import com.CollegeTravel.trip_service.dto.Response.UserSummaryDTO;
import com.CollegeTravel.trip_service.entity.OutboxEvent;
import com.CollegeTravel.trip_service.entity.Trip;
import com.CollegeTravel.trip_service.event.TripCreatedEvent;
import com.CollegeTravel.trip_service.event.TripEventPublisher;
import com.CollegeTravel.trip_service.event.TripMatchedEvent;
import com.CollegeTravel.trip_service.exception.TripAccessDeniedException;
import com.CollegeTravel.trip_service.exception.TripNotFoundException;
import com.CollegeTravel.trip_service.repository.OutboxEventRepository;
import com.CollegeTravel.trip_service.repository.TripRepository;
import com.CollegeTravel.trip_service.service.TripService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.swing.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TripServiceImpl implements TripService {
    private final TripRepository tripRepository;
    private final UserServiceClient userServiceClient;
    private final TripEventPublisher tripEventPublisher;
    private final ApplicationEventPublisher eventPublisher;
    private static final long WINDOW_HOURS =1;
    private final GroupLookupClient groupLookupClient;
    private final OutboxEventRepository outboxEventRepository;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional
    public TripCreationResponse postTrip(Trip trip){
        Trip saved = tripRepository.save(trip);
        List<MatchedTripResponse> immediateMatches = computeMatches(saved);
        if(!immediateMatches.isEmpty()){
            eventPublisher.publishEvent(new TripMatchedEvent(saved, immediateMatches));
        }
        try {
            TripCreatedEvent tripCreatedEvent = new TripCreatedEvent(
                    saved.getId(), saved.getUserId(), saved.getSourcePoint(), saved.getBoardingStation(),
                    saved.getTravelDateTime().toLocalDate()
            );
            OutboxEvent outboxEvent = OutboxEvent.builder()
                    .eventType("TripCreatedEvent")
                    .payload(objectMapper.writeValueAsString(tripCreatedEvent))
                    .createdAt(LocalDateTime.now()).build();
            outboxEventRepository.save(outboxEvent);
        } catch (Exception e) {
            throw new RuntimeException("Failed to save event to outbox",e);
        }
        return new TripCreationResponse(saved, immediateMatches);
    }
    @Override
    public List<MatchedTripResponse> findMatches(Long tripId,Long requestingUserId){


        Trip trip = tripRepository.findById(tripId).orElseThrow(()->new TripNotFoundException("Trip Not found" + tripId));

        if(!trip.getUserId().equals(requestingUserId)){
            throw  new TripAccessDeniedException("You can only view matches for your own trips");

        }
        return computeMatches(trip);


    }
    @Override
    public boolean userHasMatchingTrip(Long userId, String sourcePoint, String boardingStation, LocalDate travelDate){
        LocalDateTime dayStart =travelDate.atStartOfDay();
        LocalDateTime dayEnd = travelDate.atTime(23,59,59);
        return tripRepository.existsMatchingTrip(userId, sourcePoint, boardingStation,dayStart, dayEnd);
    }

    @Override
    public List<ExploreTripResponse> getExploreTrips(Long userId) {
    List<Trip> othersTrips = tripRepository.findByUserIdNot(userId);
    if (othersTrips.isEmpty()){
        return List.of();
    }
    List<Long> userIds = othersTrips.stream()
            .map(Trip::getUserId)
            .distinct()
            .toList();
        Map<Long, String> tempMap;
        try {
            List<UserSummaryDTO> users = userServiceClient.getUsersByIds(userIds);
            tempMap = users.stream().collect(Collectors.toMap(UserSummaryDTO::id, UserSummaryDTO::name));

        } catch (Exception e) {
            tempMap = Map.of();

        }
        final Map<Long, String> userNameMap = tempMap;
        return othersTrips.stream()
                .map(trip ->{
                    String name = userNameMap.getOrDefault(trip.getUserId(), "Unknown");
                    return new ExploreTripResponse(trip, name);

                })
                .toList();
    }



    private List<MatchedTripResponse> computeMatches(Trip trip){
        LocalDateTime windowStart = trip.getTravelDateTime().minusHours(WINDOW_HOURS);
        LocalDateTime windowEnd = trip.getTravelDateTime().plusHours(WINDOW_HOURS);

        List<Trip> matched = tripRepository.findCandidates(
                trip.getId(), trip.getUserId(), trip.getSourcePoint(), trip.getBoardingStation(), windowStart, windowEnd
        );
        GroupLookupResult lookupResult = groupLookupClient.findExistingGroup(
                trip.getSourcePoint(), trip.getBoardingStation(), trip.getTravelDateTime().toLocalDate()
        );
        List<Long> userIds =  matched.stream().map(Trip::getUserId).toList();
        Map<Long, String> userNameMap;
        if (!userIds.isEmpty()) {
            List<UserSummaryDTO> users = userServiceClient.getUsersByIds(userIds);
            userNameMap = users.stream().collect(Collectors.toMap(UserSummaryDTO::id, UserSummaryDTO::name));
        } else {
            userNameMap = Map.of();
        }
        return matched.stream()
                .map(m -> {
                    String name = userNameMap.getOrDefault(m.getUserId(), "Unknown");
                    return new MatchedTripResponse(m, name, lookupResult.groupId(), lookupResult.available());
                })
                .toList();
    }
}
