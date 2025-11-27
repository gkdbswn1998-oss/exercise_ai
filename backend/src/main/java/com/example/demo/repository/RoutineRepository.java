package com.example.demo.repository;

import com.example.demo.entity.Routine;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface RoutineRepository extends JpaRepository<Routine, Long> {
    List<Routine> findByUserId(Long userId);
    Optional<Routine> findByUserIdAndRoutineType(Long userId, String routineType);
}

