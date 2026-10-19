package com.CollegeTravel.Group_service.event;

import com.CollegeTravel.Group_service.repository.GroupRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class TripCreatedListener {

    private final GroupRepository groupRepository;

    @RabbitListener(queues = "trip-created-queue")
    public void handleTripCreated(TripCreatedEvent event){
        log.info("Received TripCreatedEvent for tripId: {}, route: {} -> {}, date: {}",
                event.tripId(), event.sourcePoint(), event.boardingStation(), event.travelDate());

        groupRepository.findBySourcePointAndBoardingStationAndTravelDate(
                event.sourcePoint(), event.boardingStation(), event.travelDate()
        ).ifPresentOrElse(
                group -> log.info("Existing squad group #{} found for tripId: {}", group.getId(), event.tripId()),
                () -> log.info("No existing squad group found yet for tripId: {}", event.tripId())
        );
    }

}
