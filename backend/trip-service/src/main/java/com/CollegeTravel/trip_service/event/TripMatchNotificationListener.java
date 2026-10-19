package com.CollegeTravel.trip_service.event;

import com.CollegeTravel.trip_service.dto.Response.MatchedTripResponse;
import jakarta.transaction.Transaction;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
public class TripMatchNotificationListener {

    private final UserServiceClient userServiceClient;
    private final JavaMailSender mailSender;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @Async("notificationExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onTripMatched(TripMatchedEvent event){
        if (event == null || event.getMatchedExistingTrips().isEmpty()){
            return;
        }
        // 1. Collect distinct user IDs to eliminate redundant lookups
        List<Long> recipientUserIds = event.getMatchedExistingTrips().stream()
                .map(MatchedTripResponse::trip)
                .filter(Objects::nonNull)
                .map(trip -> trip.getUserId())
                .filter(Objects::nonNull)
                .distinct()
                .collect(Collectors.toList());
        if (recipientUserIds.isEmpty()){
            return;
        }


            try{
                // 2. Single batch network call to user-service
                Map<Long, String> emailMap = userServiceClient.getEmailsByUserIds(recipientUserIds);
                if (emailMap == null || emailMap.isEmpty()){
                    return;
                }
                // 3. Prepare messages in batch
                List<SimpleMailMessage>  messageToSend = new ArrayList<>();
                String travelDate = event.getNewTrip().getTravelDateTime() != null?
                        event.getNewTrip().getTravelDateTime().toLocalDate().toString():"an upcoming date";
                String baseUrl = (frontendUrl != null && frontendUrl.endsWith("/")) ?
                        frontendUrl.substring(0, frontendUrl.length() - 1) : frontendUrl;
                String tripDetailsUrl = baseUrl + "/view-details/" + event.getNewTrip().getId();

                String subject = "SquadStation - A new travel partner just matched your trip!";
                String body = "Hello,\n\n" +
                        "Great news! A new travel partner just matched your upcoming trip.\n\n" +
                        "Trip Details:\n" +
                        "• Route: " + event.getNewTrip().getSourcePoint() + " -> " + event.getNewTrip().getBoardingStation() + "\n" +
                        "• Date: " + travelDate + "\n\n" +
                        "Click the link below to view trip details and connect with your squad in chat:\n" +
                        tripDetailsUrl + "\n\n" +
                        "Safe travels,\n" +
                        "SquadStation Team";

                for (Long userId: recipientUserIds){
                    String email = emailMap.get(userId);
                    if (email!= null && !email.isBlank()){
                        SimpleMailMessage message = new SimpleMailMessage();
                        message.setTo(email);
                        message.setSubject(subject);
                        message.setText(body);
                        messageToSend.add(message);
                    }
                }
                // 4. Batch send messages through JavaMailSender
                if (!messageToSend.isEmpty()){
                    mailSender.send(messageToSend.toArray(new SimpleMailMessage[0]));
                }

            }
            catch (Exception e){
            log.error("Failed to process match notifications for tripId: {}",event.getNewTrip()!=null? event.getNewTrip().getId() : "unknown", e);

            }

    }


}
