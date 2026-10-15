package com.CollegeTravel.marketplace_service.service;

import com.CollegeTravel.marketplace_service.dto.CreateListingRequest;
import com.CollegeTravel.marketplace_service.dto.ListingResponse;
import com.CollegeTravel.marketplace_service.entity.TicketListing;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;

public interface MarketplaceService {
    TicketListing createListing(Long userId, CreateListingRequest request);
    Page<ListingResponse> browseListings(Pageable pageable);
    Page<ListingResponse> searchListings(String source, String destination, LocalDate travelDate, Pageable pageable);
    Page<ListingResponse> getMyListings(Long userId, Pageable pageable);
    void markAsSold(Long listingId, Long userId);
    void deleteListing(Long listingId, Long userId);
    void expressInternet(Long listingId, Long userId);
    Page<String> getInterestedUsers(Long listingId, Long ownerUserId,Pageable pageable);
    Long getListingOwner(Long listingId);
    ListingResponse getListingById(Long listingId);
}
