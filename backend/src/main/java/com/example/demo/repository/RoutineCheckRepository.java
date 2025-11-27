package com.example.demo.repository;

import com.example.demo.entity.RoutineCheck;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface RoutineCheckRepository extends JpaRepository<RoutineCheck, Long> {
    List<RoutineCheck> findByUserId(Long userId);
    Optional<RoutineCheck> findByUserIdAndCheckDateAndRoutineType(Long userId, LocalDate checkDate, String routineType);
    List<RoutineCheck> findByUserIdAndCheckDate(Long userId, LocalDate checkDate);
    List<RoutineCheck> findByUserIdAndCheckDateBetween(Long userId, LocalDate startDate, LocalDate endDate);
}

