package com.CollegeTravel.marketplace_service.dto;

import com.CollegeTravel.marketplace_service.enumm.ListingType;
import com.CollegeTravel.marketplace_service.enumm.TicketStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record ListingResponse(Long id, Long postedByUserId, String postedByUserName, ListingType listingType, TicketStatus status,
                              String ticketClass, String source, String destination, LocalDate travelDate, BigDecimal price,
                              Integer quantity, String description, boolean active, LocalDateTime postedAt, int interestCount) {
}
