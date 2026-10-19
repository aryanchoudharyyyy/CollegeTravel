package com.CollegeTravel.Group_service.event;

import com.CollegeTravel.Group_service.entity.Group;
import com.CollegeTravel.Group_service.repository.GroupRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TripCreatedListenerTest {

    @Mock
    private GroupRepository groupRepository;

    @InjectMocks
    private TripCreatedListener listener;

    @Test
    void handleTripCreated_existingGroupFound() {
        LocalDate travelDate = LocalDate.of(2026, 11, 20);
        TripCreatedEvent event = new TripCreatedEvent(101L, 1L, "Campus", "Station", travelDate);

        Group group = new Group();
        group.setId(42L);
        group.setSourcePoint("Campus");
        group.setBoardingStation("Station");
        group.setTravelDate(travelDate);

        when(groupRepository.findBySourcePointAndBoardingStationAndTravelDate("Campus", "Station", travelDate))
                .thenReturn(Optional.of(group));

        listener.handleTripCreated(event);

        verify(groupRepository).findBySourcePointAndBoardingStationAndTravelDate("Campus", "Station", travelDate);
    }

    @Test
    void handleTripCreated_noGroupFound() {
        LocalDate travelDate = LocalDate.of(2026, 11, 20);
        TripCreatedEvent event = new TripCreatedEvent(102L, 2L, "Gate B", "Station", travelDate);

        when(groupRepository.findBySourcePointAndBoardingStationAndTravelDate("Gate B", "Station", travelDate))
                .thenReturn(Optional.empty());

        listener.handleTripCreated(event);

        verify(groupRepository).findBySourcePointAndBoardingStationAndTravelDate("Gate B", "Station", travelDate);
    }
}
