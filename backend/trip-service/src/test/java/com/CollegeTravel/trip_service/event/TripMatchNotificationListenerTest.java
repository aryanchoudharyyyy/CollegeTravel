package com.CollegeTravel.trip_service.event;

import com.CollegeTravel.trip_service.dto.Response.MatchedTripResponse;
import com.CollegeTravel.trip_service.entity.Trip;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TripMatchNotificationListenerTest {

    @Mock
    private UserServiceClient userServiceClient;

    @Mock
    private JavaMailSender mailSender;

    @InjectMocks
    private TripMatchNotificationListener listener;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(listener, "frontendUrl", "http://localhost:5173");
    }

    @Test
    void onTripMatched_sendsEmailWithTripDetailsLink() {
        // Arrange
        Trip newTrip = new Trip();
        newTrip.setId(101L);
        newTrip.setUserId(1L);
        newTrip.setSourcePoint("Campus Gate A");
        newTrip.setBoardingStation("Central Station");
        newTrip.setTravelDateTime(LocalDateTime.of(2026, 11, 20, 14, 30));

        Trip existingTrip = new Trip();
        existingTrip.setId(99L);
        existingTrip.setUserId(2L);
        existingTrip.setSourcePoint("Campus Gate A");
        existingTrip.setBoardingStation("Central Station");

        MatchedTripResponse match = new MatchedTripResponse(existingTrip, "Traveler B", null, false);
        TripMatchedEvent event = new TripMatchedEvent(newTrip, List.of(match));

        when(userServiceClient.getEmailsByUserIds(List.of(2L)))
                .thenReturn(Map.of(2L, "traveler2@college.edu"));

        // Act
        listener.onTripMatched(event);

        // Assert
        ArgumentCaptor<SimpleMailMessage[]> captor = ArgumentCaptor.forClass(SimpleMailMessage[].class);
        verify(mailSender).send(captor.capture());

        SimpleMailMessage[] sent = captor.getValue();
        assertEquals(1, sent.length);
        assertEquals("traveler2@college.edu", sent[0].getTo()[0]);
        assertTrue(sent[0].getSubject().contains("SquadStation"));
        assertTrue(sent[0].getText().contains("Campus Gate A -> Central Station"));
        assertTrue(sent[0].getText().contains("2026-11-20"));
        assertTrue(sent[0].getText().contains("http://localhost:5173/view-details/101"));
    }

    @Test
    void onTripMatched_emptyMatches_doesNothing() {
        Trip newTrip = new Trip();
        newTrip.setId(101L);
        TripMatchedEvent event = new TripMatchedEvent(newTrip, List.of());

        listener.onTripMatched(event);

        verifyNoInteractions(userServiceClient);
        verifyNoInteractions(mailSender);
    }
}
