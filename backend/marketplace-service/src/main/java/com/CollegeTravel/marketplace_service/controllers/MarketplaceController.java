package com.CollegeTravel.marketplace_service.controllers;

import com.CollegeTravel.marketplace_service.dto.CreateListingRequest;
import com.CollegeTravel.marketplace_service.dto.ListingResponse;
import com.CollegeTravel.marketplace_service.entity.TicketListing;
import com.CollegeTravel.marketplace_service.service.MarketplaceService;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/marketplace")
@RequiredArgsConstructor
public class MarketplaceController {
    private final MarketplaceService marketplaceService;
    private final ServletRequest httpServletRequest;

    @PostMapping("/listings")
    public TicketListing createListing(@Valid @RequestBody CreateListingRequest request, HttpServletRequest httpRequest){
        return marketplaceService.createListing((Long) httpRequest.getAttribute("userId"),request);
    }

    @GetMapping("/listings")
    public Page<ListingResponse> browseListings(@PageableDefault(size=20) Pageable pageable){
        return  marketplaceService.browseListings(pageable);
    }
    @GetMapping("/listings/search")
    public Page<ListingResponse> searchListings(@RequestParam String source, @RequestParam String destination,@RequestParam LocalDate travelDate, @PageableDefault(size=20) Pageable pageable){
        return marketplaceService.searchListings(source, destination, travelDate,pageable);
    }
    @GetMapping("/listings/mine")
    public Page<ListingResponse> getMyListings(HttpServletRequest httpRequest,@PageableDefault(size = 20) Pageable pageable){
        return marketplaceService.getMyListings((Long) httpRequest.getAttribute("userId"),pageable);
    }
    @PatchMapping("/listings/{listingid}")
    public String deleteListing(@PathVariable Long listingid, HttpServletRequest httpServletRequest){
        marketplaceService.deleteListing(listingid, (Long) httpServletRequest.getAttribute("userId"));
        return "Listing deleted";
    }
    @PostMapping("/listings/{listingId}/interest")
    public String expressInterest(@PathVariable Long listingId,HttpServletRequest request){
        marketplaceService.expressInternet(listingId, (Long) request.getAttribute("userId"));
        return "Interest recorder";
    }
    @GetMapping("/listings/{listingId}/interested-users")
    public Page<String> getInterestedUsers(
            @PathVariable Long listingId,
            HttpServletRequest httpServletRequest,
            @PageableDefault(size = 20) Pageable pageable) {
        return marketplaceService.getInterestedUsers(listingId, (Long) httpServletRequest.getAttribute("userId"),pageable);
    }
    @GetMapping("/listings/{listingId}")
    public ListingResponse getListingById(@PathVariable Long listingId) {
        return marketplaceService.getListingById(listingId);
    }

}
