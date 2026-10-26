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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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
    private static final int MATCH_PAGE_SIZE = 20;
    private final GroupLookupClient groupLookupClient;
    private final OutboxEventRepository outboxEventRepository;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional
    public TripCreationResponse postTrip(Trip trip){
        Trip saved = tripRepository.save(trip);
        Pageable immediateMatchPage = PageRequest.of(0, MATCH_PAGE_SIZE, Sort.by(Sort.Direction.DESC, "id"));
        Page<MatchedTripResponse> immediateMatches = computeMatches(saved, immediateMatchPage);
        if(!immediateMatches.isEmpty()){
            for (int pageNumber = 0; pageNumber < immediateMatches.getTotalPages(); pageNumber++) {
                Page<MatchedTripResponse> notificationPage = pageNumber == 0
                        ? immediateMatches
                        : computeMatches(saved, PageRequest.of(pageNumber, MATCH_PAGE_SIZE, Sort.by(Sort.Direction.DESC, "id")));
                eventPublisher.publishEvent(new TripMatchedEvent(saved, notificationPage.getContent()));
            }
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
        return new TripCreationResponse(saved, immediateMatches.getContent(), immediateMatches.hasNext());
    }
    @Override
    public Page<MatchedTripResponse> findMatches(Long tripId,Long requestingUserId, Pageable pageable){


        Trip trip = tripRepository.findById(tripId).orElseThrow(()->new TripNotFoundException("Trip Not found" + tripId));

        if(!trip.getUserId().equals(requestingUserId)){
            throw  new TripAccessDeniedException("You can only view matches for your own trips");

        }
        return computeMatches(trip, pageable);


    }
    @Override
    public boolean userHasMatchingTrip(Long userId, String sourcePoint, String boardingStation, LocalDate travelDate){
        LocalDateTime dayStart =travelDate.atStartOfDay();
        LocalDateTime dayEnd = travelDate.atTime(23,59,59);
        return tripRepository.existsMatchingTrip(userId, sourcePoint, boardingStation,dayStart, dayEnd);
    }

    @Override
    public Page<ExploreTripResponse> getExploreTrips(Long userId, Pageable pageable) {
    Page<Trip> othersTrips = tripRepository.findByUserIdNot(userId, pageable);
    if (othersTrips.isEmpty()){
        return othersTrips.map(trip -> new ExploreTripResponse(trip, "Unknown"));
    }
    List<Long> userIds = othersTrips.getContent().stream()
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
        List<ExploreTripResponse> responses = othersTrips.getContent().stream()
                .map(trip ->{
                    String name = userNameMap.getOrDefault(trip.getUserId(), "Unknown");
                    return new ExploreTripResponse(trip, name);

                })
                .toList();
        return new PageImpl<>(responses, pageable, othersTrips.getTotalElements());
    }

    @Override
    public Page<Trip> getMyTrips(Long userId, Pageable pageable) {
        return tripRepository.findByUserId(userId, pageable);
    }

    @Override
    public ExploreTripResponse getExploreTrip(Long tripId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new TripNotFoundException("Trip not found: " + tripId));
        String name = "Unknown";
        try {
            List<UserSummaryDTO> users = userServiceClient.getUsersByIds(List.of(trip.getUserId()));
            if (users != null && !users.isEmpty()) name = users.get(0).name();
        } catch (Exception ignored) {
        }
        return new ExploreTripResponse(trip, name);
    }

    @Override
    @Transactional
    public void deleteTrip(Long tripId, Long userId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new TripNotFoundException("Trip not found with ID: " + tripId));
        if (!trip.getUserId().equals(userId)) {
            throw new TripAccessDeniedException("You can only delete your own trips");
        }
        tripRepository.delete(trip);
    }


    private Page<MatchedTripResponse> computeMatches(Trip trip, Pageable pageable){
        LocalDateTime windowStart = trip.getTravelDateTime().minusHours(WINDOW_HOURS);
        LocalDateTime windowEnd = trip.getTravelDateTime().plusHours(WINDOW_HOURS);

        Page<Trip> matched = tripRepository.findCandidates(
                trip.getId(), trip.getUserId(), trip.getSourcePoint(), trip.getBoardingStation(), windowStart, windowEnd, pageable
        );
        GroupLookupResult lookupResult = groupLookupClient.findExistingGroup(
                trip.getSourcePoint(), trip.getBoardingStation(), trip.getTravelDateTime().toLocalDate()
        );
        List<Long> userIds =  matched.getContent().stream().map(Trip::getUserId).toList();
        Map<Long, String> userNameMap;
        if (!userIds.isEmpty()) {
            List<UserSummaryDTO> users = userServiceClient.getUsersByIds(userIds);
            userNameMap = users.stream().collect(Collectors.toMap(UserSummaryDTO::id, UserSummaryDTO::name));
        } else {
            userNameMap = Map.of();
        }
        List<MatchedTripResponse> responses = matched.getContent().stream()
                .map(m -> {
                    String name = userNameMap.getOrDefault(m.getUserId(), "Unknown");
                    return new MatchedTripResponse(m, name, lookupResult.groupId(), lookupResult.available());
                })
                .toList();
        return new PageImpl<>(responses, pageable, matched.getTotalElements());
    }
}
