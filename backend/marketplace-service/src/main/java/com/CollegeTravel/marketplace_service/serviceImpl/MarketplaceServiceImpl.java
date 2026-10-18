package com.CollegeTravel.marketplace_service.serviceImpl;

import com.CollegeTravel.marketplace_service.client.UserLookupClient;
import com.CollegeTravel.marketplace_service.client.UserSummaryDTO;
import com.CollegeTravel.marketplace_service.dto.CreateListingRequest;
import com.CollegeTravel.marketplace_service.dto.ListingResponse;
import com.CollegeTravel.marketplace_service.entity.ListingInterest;
import com.CollegeTravel.marketplace_service.entity.TicketListing;
import com.CollegeTravel.marketplace_service.exception.AlreadyExpressedInterestException;
import com.CollegeTravel.marketplace_service.exception.CannotExpressInterestInOwnListingException;
import com.CollegeTravel.marketplace_service.exception.ListingNotFoundException;
import com.CollegeTravel.marketplace_service.exception.NotListingOwnerException;
import com.CollegeTravel.marketplace_service.repository.InterestCountProjection;
import com.CollegeTravel.marketplace_service.repository.ListingInterestRepository;
import com.CollegeTravel.marketplace_service.repository.TicketListingRepository;
import com.CollegeTravel.marketplace_service.service.MarketplaceService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MarketplaceServiceImpl implements MarketplaceService {
    private  final TicketListingRepository listingRepository;
    private  final ListingInterestRepository interestRepository;
    private final UserLookupClient userLookupClient;

    @Override
    public TicketListing createListing(Long userId, CreateListingRequest request){
        TicketListing listing = new TicketListing();
        listing.setPostedByUserId(userId);
        listing.setListingType(request.listingType());
        listing.setStatus(request.status());
        listing.setTicketClass(request.ticketClass());
        listing.setSource(request.source());
        listing.setDestination(request.destination());
        listing.setTravelDate(request.travelDate());
        listing.setPrice(request.price());
        listing.setQuantity(request.quantity());
        listing.setDescription(request.description());
        return listingRepository.save(listing);

    }

    @Override
    public Page<ListingResponse> browseListings(Pageable pageable) {
        Page<TicketListing> page = listingRepository.findByActiveTrueOrderByPostedAtDesc(pageable);
        return mapToResponsePage(page);
    }

    @Override
    public Page<ListingResponse> searchListings(String source, String destination, LocalDate travelDate, Pageable pageable) {
        Page<TicketListing> page =listingRepository.findByActiveTrueAndSourceAndDestinationAndTravelDate(source, destination, travelDate,pageable);
        return mapToResponsePage(page);

    }

    @Override
    public Page<ListingResponse> getMyListings(Long userId,Pageable pageable) {
        Page<TicketListing> page = listingRepository.findByPostedByUserId(userId, pageable);
        return mapToResponsePage(page);
    }

    @Override
    public void markAsSold(Long listingId, Long userId) {
        TicketListing listing = getOwnedListing(listingId, userId);
        listing.setActive(false);
        listingRepository.save(listing);
    }

    @Override
    public void deleteListing(Long listingId, Long userId) {
        listingRepository.delete(getOwnedListing(listingId, userId));
    }

    @Override
    @Transactional
    public void expressInternet(Long listingId, Long userId) {
        TicketListing listing =listingRepository.findById(listingId)
                .orElseThrow(()-> new ListingNotFoundException("Listing not found: "+ listingId));
        if (listing.getPostedByUserId().equals(userId)){
            throw new CannotExpressInterestInOwnListingException("You cannot interest in your own listing");
        }
        if (interestRepository.existsByListing_IdAndUserId(listingId,userId)){
            throw  new AlreadyExpressedInterestException("You have already express interest in this listing");
        }
        ListingInterest interest = new ListingInterest();
        interest.setListing(listing);
        interest.setUserId(userId);
        try {
            interestRepository.save(interest);
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            throw new AlreadyExpressedInterestException("You have already express interest in this listing");
        }
    }

    @Override
    public Page<String> getInterestedUsers(Long listingId, Long ownerUserId,Pageable pageable) {
        getOwnedListing(listingId, ownerUserId);
        Page<ListingInterest> interestsPage = interestRepository.findByListing_Id(listingId,pageable);
        if (interestsPage.isEmpty()){
            return Page.empty();
        }
        // 3. Extract the user IDs for just this page

        List<Long> userIds = interestsPage.getContent().stream()
                .map(ListingInterest::getUserId)
                .toList();
        // 4. Safely call the User Service with a small, manageable list of IDs
        List<String> userNames = userLookupClient.getUserByIds(userIds).stream()
                .map(UserSummaryDTO::name)
                .toList();
        // 5. Wrap the result back into a Page object so the frontend knows how many total pages exist
        return new PageImpl<>(userNames, pageable, interestsPage.getTotalElements());
    }

    @Override
    public Long getListingOwner(Long listingId) {
        return listingRepository.findById(listingId)
                .orElseThrow(()-> new ListingNotFoundException("Listing Not found: "+ listingId))
                .getPostedByUserId();
    }

    @Override
    public ListingResponse getListingById(Long listingId) {
        TicketListing listing = listingRepository.findById(listingId)
                .orElseThrow(()->new ListingNotFoundException("Listing not found:" + listingId));
        List<InterestCountProjection> counts = interestRepository.countInterestsByListingIds(List.of(listingId));
        int count = counts.isEmpty() ? 0 : counts.get(0).getCount();
        String sellerName = null;
        try {
            List<UserSummaryDTO> users = userLookupClient.getUserByIds(List.of(listing.getPostedByUserId()));
            if (users!=null && !users.isEmpty()){
                sellerName = users.get(0).name();
            }
        }
        catch (Exception ignored){}



        return toResponse(listing, Map.of(listing.getId(), count), sellerName);
    }

    private TicketListing getOwnedListing(Long listingId, Long userId){
        TicketListing listing = listingRepository.findById(listingId)
                .orElseThrow(
                        ()-> new ListingNotFoundException("Listing not found: "+ listingId)
                );
        if (!listing.getPostedByUserId().equals(userId)){
            throw  new NotListingOwnerException("You can only manage your own listings");
        }
        return listing;
    }
    private ListingResponse toResponse(TicketListing l, Map<Long, Integer> countsMap, String sellerName){

        int interestedCount = countsMap.getOrDefault(l.getId(),0);
        return  new ListingResponse(l.getId(), l.getPostedByUserId(), sellerName,l.getListingType(), l.getStatus(),
                l.getTicketClass(),l.getSource(),l.getDestination(),l.getTravelDate(),l.getPrice(),
        l.getQuantity(),l.getDescription(),l.isActive(),l.getPostedAt(), interestedCount);
    }
    private Page<ListingResponse> mapToResponsePage(Page<TicketListing> page){
        if (page.isEmpty()){
            return Page.empty();
        }
        // 1. Get all listing IDs for just this page
        List<Long> listingIds = page.getContent().stream()
                .map(TicketListing::getId)
                .toList();
        // 2. Fetch interest counts in ONE query (Ensure you added this to ListingInterestRepository)
        List< InterestCountProjection> countsList = interestRepository.countInterestsByListingIds(listingIds);
        // 3. Convert to Map for instant lookup
        Map<Long,Integer> countMap =countsList.stream().collect(
                Collectors.toMap(
                        InterestCountProjection::getListingId,
                        InterestCountProjection::getCount
                )
        );
        return page.map(listing ->toResponse(listing, countMap, null));


    }
}

