package com.example.demo.repository;

import com.example.demo.entity.ChallengeShare;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ChallengeShareRepository extends JpaRepository<ChallengeShare, Long> {
    // 받은 공유 요청 조회 (대기 중인 것만)
    List<ChallengeShare> findByToUserIdAndStatusOrderByCreatedAtDesc(Long toUserId, String status);
    
    // 보낸 공유 요청 조회
    List<ChallengeShare> findByFromUserIdOrderByCreatedAtDesc(Long fromUserId);
    
    // 수락된 공유 조회
    List<ChallengeShare> findByToUserIdAndStatus(Long toUserId, String status);
    
    // 특정 챌린지와 사용자로 공유 조회
    List<ChallengeShare> findByChallengeIdAndToUserIdAndStatus(Long challengeId, Long toUserId, String status);
}


