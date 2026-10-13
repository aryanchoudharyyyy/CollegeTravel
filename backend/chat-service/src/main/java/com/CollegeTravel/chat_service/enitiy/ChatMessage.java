package com.CollegeTravel.chat_service.enitiy;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@Table(
        name = "chat_messages",
        indexes = {
                @Index(
                        name = "idx_chat_messages_group_time_id",
                        columnList = "group_id, send_at, id"
                )
        }
)
public class ChatMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private  Long groupId;

    @Column(nullable = false)
    private Long senderId;

    @Column(nullable = false, length = 1000)
    private String content;

    @Column(length = 100)
    private String senderName;

    private LocalDateTime sendAt;
    @PrePersist
    protected void onCreate(){
        sendAt = LocalDateTime.now();
    }
}
