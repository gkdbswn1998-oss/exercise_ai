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
        private Integer exerciseDurationDiff;  // 목표 대비 차이 (실제 - 목표)
        private boolean weightSuccess;
        private boolean bodyFatSuccess;
        private boolean muscleMassSuccess;
        private boolean exerciseDurationSuccess;
        // 루틴 체크 정보
        private Integer morningRoutineTotal;  // 아침루틴 전체 항목 수
        private Integer morningRoutineChecked;  // 아침루틴 체크된 항목 수
        private Integer eveningRoutineTotal;  // 저녁루틴 전체 항목 수
        private Integer eveningRoutineChecked;  // 저녁루틴 체크된 항목 수
    }

    @Getter
    @Setter
    public static class OverallProgress {
        private int totalDays;
        private int weightSuccessCount;
        private int bodyFatSuccessCount;
        private int muscleMassSuccessCount;
        private int exerciseDurationSuccessCount;
        private int weightRecordedDays;
        private int bodyFatRecordedDays;
        private int muscleMassRecordedDays;
        private int exerciseDurationRecordedDays;
        private double weightSuccessRate;
        private double bodyFatSuccessRate;
        private double muscleMassSuccessRate;
        private double exerciseDurationSuccessRate;
        // 루틴 체크 성공률
        private int morningRoutineSuccessDays;  // 아침루틴 전체 성공한 날 수
        private int eveningRoutineSuccessDays;  // 저녁루틴 전체 성공한 날 수
        private int morningRoutineRecordedDays;  // 아침루틴 기록이 있는 날 수
        private int eveningRoutineRecordedDays;  // 저녁루틴 기록이 있는 날 수
        private double morningRoutineSuccessRate;  // 아침루틴 성공률
        private double eveningRoutineSuccessRate;  // 저녁루틴 성공률
    }
}


