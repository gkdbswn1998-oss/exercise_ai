package com.example.demo.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChallengeShareRequest {
    private Long toUserId;  // 공유 받을 사용자 ID
    private Long challengeId;  // 공유할 챌린지 ID
}


