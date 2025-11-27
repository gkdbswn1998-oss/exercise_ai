package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "challenges")
public class Challenge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String name;  // 챌린지명

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;  // 시작일

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;  // 종료일

    @Column(name = "target_weight")
    private Double targetWeight;  // 목표 체중

    @Column(name = "target_body_fat_percentage")
    private Double targetBodyFatPercentage;  // 목표 체지방률

    @Column(name = "target_muscle_mass")
    private Double targetMuscleMass;  // 목표 근육량

    @Column(name = "target_exercise_duration")
    private Integer targetExerciseDuration;  // 목표 운동 시간 (분)

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



