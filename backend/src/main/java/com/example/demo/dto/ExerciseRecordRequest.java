package com.example.demo.dto;

import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;

@Getter
@Setter
public class ExerciseRecordRequest {
    private LocalDate recordDate;  // 기록 날짜
    private Double weight;  // 체중
    private Double bodyFatPercentage;  // 체지방률
    private Double muscleMass;  // 근육량
    private String exerciseType;  // 운동종류
    private Integer exerciseDuration;  // 운동시간 (분)
    private String imageUrl;  // 첨부 사진 URL
}



