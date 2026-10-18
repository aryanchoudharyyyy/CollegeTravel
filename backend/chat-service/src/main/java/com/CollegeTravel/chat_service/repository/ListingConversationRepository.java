package com.CollegeTravel.chat_service.repository;

import com.CollegeTravel.chat_service.enitiy.ListingConversation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ListingConversationRepository extends JpaRepository<ListingConversation, Long> {
    Optional<ListingConversation> findByListingIdAndBuyerId(Long listingId, Long buyerId);
    List<ListingConversation> findByBuyerIdOrSellerIdOrderByStartedAtDesc(Long buyerId, Long sellerId);
}
