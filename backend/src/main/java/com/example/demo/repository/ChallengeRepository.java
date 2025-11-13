package com.example.demo.repository;

import com.example.demo.entity.Challenge;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;

public interface ChallengeRepository extends JpaRepository<Challenge, Long> {
    List<Challenge> findByUserIdOrderByStartDateDesc(Long userId);
    List<Challenge> findByUserIdAndEndDateBeforeOrderByStartDateDesc(Long userId, LocalDate date);
    List<Challenge> findByUserIdAndEndDateGreaterThanEqualOrderByStartDateDesc(Long userId, LocalDate date);
}



