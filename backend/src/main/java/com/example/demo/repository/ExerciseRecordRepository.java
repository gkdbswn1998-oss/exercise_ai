package com.example.demo.repository;

import com.example.demo.entity.ExerciseRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.Optional;
import java.util.List;

public interface ExerciseRecordRepository extends JpaRepository<ExerciseRecord, Long> {
    Optional<ExerciseRecord> findByUserIdAndRecordDate(Long userId, LocalDate recordDate);
    List<ExerciseRecord> findByUserIdOrderByRecordDateDesc(Long userId);
    List<ExerciseRecord> findByUserIdAndRecordDateBetween(Long userId, LocalDate startDate, LocalDate endDate);
}



