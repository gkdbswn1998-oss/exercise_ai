package com.example.demo.dto;

import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
public class SharedChallengeDetailResponse {
    private ChallengeResponse challenge;
    private List<DailyProgress> dailyProgress;
    private OverallProgress overallProgress;

    @Getter
    @Setter
    public static class DailyProgress {
        private LocalDate date;
        private Double weightDiff;  // 목표 대비 차이 (실제 - 목표)
        private Double bodyFatDiff;
        private Double muscleMassDiff;
        private Double musclePercentageDiff;
        private Integer exerciseDurationDiff;  // 목표 대비 차이 (실제 - 목표)
        private boolean weightSuccess;
        private boolean bodyFatSuccess;
        private boolean muscleMassSuccess;
        private boolean musclePercentageSuccess;
        private boolean exerciseDurationSuccess;
    }

    @Getter
    @Setter
    public static class OverallProgress {
        private int totalDays;
        private int weightSuccessCount;
        private int bodyFatSuccessCount;
        private int muscleMassSuccessCount;
        private int musclePercentageSuccessCount;
        private int exerciseDurationSuccessCount;
        private int weightRecordedDays;
        private int bodyFatRecordedDays;
        private int muscleMassRecordedDays;
        private int musclePercentageRecordedDays;
        private int exerciseDurationRecordedDays;
        private double weightSuccessRate;
        private double bodyFatSuccessRate;
        private double muscleMassSuccessRate;
        private double musclePercentageSuccessRate;
        private double exerciseDurationSuccessRate;
    }
}


