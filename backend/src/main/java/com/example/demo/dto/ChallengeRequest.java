package com.example.demo.dto;

import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;

@Getter
@Setter
public class ChallengeRequest {
    private String name;
    private LocalDate startDate;
    private LocalDate endDate;
    private Double targetWeight;
    private Double targetBodyFatPercentage;
    private Double targetMuscleMass;
    private Integer targetExerciseDuration;
}



