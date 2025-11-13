package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "exercise_records")
public class ExerciseRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "record_date", nullable = false)
    private LocalDate recordDate;  // 기록 날짜

    private Double weight;  // 체중 (kg)
    
    @Column(name = "body_fat_percentage")
    private Double bodyFatPercentage;  // 체지방률 (%)
    
    private Double muscleMass;  // 근육량 (kg)
    
    @Column(name = "muscle_percentage")
    private Double musclePercentage;  // 근육률 (%)
    
    @Column(name = "exercise_type")
    private String exerciseType;  // 운동종류 (러닝, 헬스, 테니스 등)
    
    @Column(name = "exercise_duration")
    private Integer exerciseDuration;  // 운동시간 (분)

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}



