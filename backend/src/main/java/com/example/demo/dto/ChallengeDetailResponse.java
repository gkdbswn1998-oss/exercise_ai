package com.example.demo.dto;

import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
public class ChallengeDetailResponse {
    private ChallengeResponse challenge;
    private List<DailyProgress> dailyProgress;
    private OverallProgress overallProgress;

    @Getter
    @Setter
    public static class DailyProgress {
        private LocalDate date;
        private Double weight;
        private Double bodyFatPercentage;
        private Double muscleMass;
        private Double musclePercentage;
        private Integer exerciseDuration;
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
        private int weightRecordedDays;  // 체중 기록이 있는 날짜 수
        private int bodyFatRecordedDays;  // 체지방률 기록이 있는 날짜 수
        private int muscleMassRecordedDays;  // 근육량 기록이 있는 날짜 수
        private int musclePercentageRecordedDays;  // 근육률 기록이 있는 날짜 수
        private int exerciseDurationRecordedDays;  // 운동시간 기록이 있는 날짜 수
        private double weightSuccessRate;
        private double bodyFatSuccessRate;
        private double muscleMassSuccessRate;
        private double musclePercentageSuccessRate;
        private double exerciseDurationSuccessRate;
    }
}

