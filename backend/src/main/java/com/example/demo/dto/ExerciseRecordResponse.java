package com.example.demo.dto;

import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
public class ExerciseRecordResponse {
    private Long id;
    private Long userId;
    private LocalDate recordDate;
    private Double weight;
    private Double bodyFatPercentage;
    private Double muscleMass;
    private Double musclePercentage;
    private String exerciseType;
    private Integer exerciseDuration;
    private String imageUrl;  // 첨부 사진 URL
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}



