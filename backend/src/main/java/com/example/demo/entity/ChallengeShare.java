package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "challenge_shares")
public class ChallengeShare {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "from_user_id", nullable = false)
    private Long fromUserId;  // 공유 요청한 사용자

    @Column(name = "to_user_id", nullable = false)
    private Long toUserId;  // 공유 받을 사용자

    @Column(name = "challenge_id", nullable = false)
    private Long challengeId;  // 공유할 챌린지

    @Column(name = "status", nullable = false)
    private String status;  // PENDING(대기), ACCEPTED(수락), REJECTED(거절)

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = "PENDING";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}


