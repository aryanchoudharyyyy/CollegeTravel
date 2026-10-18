package com.CollegeTravel.chat_service.enitiy;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@Table(name = "listing_conversations", uniqueConstraints = {@UniqueConstraint(columnNames = {"listing_id", "buyer_id"})})
public class ListingConversation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "listing_id", nullable = false)
    private Long listingId;
    @Column(name = "buyer_id", nullable = false)
    private Long buyerId;
    @Column(name="seller_id", nullable = false)
    private Long sellerId;
    private LocalDateTime startedAt;
    @PrePersist protected void onCreate() { startedAt = LocalDateTime.now(); }
}