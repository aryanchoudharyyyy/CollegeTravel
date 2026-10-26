package com.CollegeTravel.chat_service.repository;

import com.CollegeTravel.chat_service.enitiy.ListingConversation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ListingConversationRepository extends JpaRepository<ListingConversation, Long> {
    Optional<ListingConversation> findByListingIdAndBuyerId(Long listingId, Long buyerId);
    Page<ListingConversation> findByBuyerIdOrSellerId(Long buyerId, Long sellerId, Pageable pageable);
}
