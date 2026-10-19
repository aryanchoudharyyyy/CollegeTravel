package com.CollegeTravel.trip_service.serviceImpl;

import com.CollegeTravel.trip_service.entity.OutboxEvent;
import com.CollegeTravel.trip_service.event.TripCreatedEvent;
import com.CollegeTravel.trip_service.event.TripEventPublisher;
import com.CollegeTravel.trip_service.repository.OutboxEventRepository;
import com.CollegeTravel.trip_service.service.OutboxScheduler;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OutboxSchedulerImpl implements OutboxScheduler {
    private final OutboxEventRepository outboxEventRepository;
    private final TripEventPublisher tripEventPublisher;
    private final ObjectMapper objectMapper;
    @Override
    @Scheduled(fixedDelay = 5000)
    public void processOutboxEvents(){
        List<OutboxEvent> events = outboxEventRepository.findAll();
        for (OutboxEvent outboxEvent:events){
            try{
                if ("TripCreatedEvent".equals(outboxEvent.getEventType())){
                    TripCreatedEvent payload = objectMapper.readValue(outboxEvent.getPayload(), TripCreatedEvent.class);
                    // publish to rabbitmq
                    tripEventPublisher.publishTripCreated(payload);
                }
                //delete the event after successful publication
                outboxEventRepository.delete(outboxEvent);

            } catch (Exception e) {
                System.out.println("Failed to process outbox event ID "+
                        outboxEvent.getId() + ": " +e.getMessage());
            }
        }
    }

}
