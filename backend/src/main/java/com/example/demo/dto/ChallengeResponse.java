package com.example.demo.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
public class ChallengeResponse {
    private Long id;
    private Long userId;
    private String name;
    private LocalDate startDate;
    private LocalDate endDate;
    private Double targetWeight;
    private Double targetBodyFatPercentage;
    private Double targetMuscleMass;
    private Integer targetExerciseDuration;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    @JsonProperty("isActive")
    private boolean isActive;  // 진행중인지 여부
}

