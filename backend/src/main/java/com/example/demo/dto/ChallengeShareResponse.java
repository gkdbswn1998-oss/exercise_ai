package com.example.demo.dto;

import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
public class ChallengeShareResponse {
    private Long id;
    private Long fromUserId;
    private String fromUserName;  // 공유 요청한 사용자 이름
    private Long toUserId;
    private Long challengeId;
    private String challengeName;  // 챌린지 이름
    private String status;  // PENDING, ACCEPTED, REJECTED
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}


