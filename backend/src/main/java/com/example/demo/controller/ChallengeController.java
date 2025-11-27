package com.example.demo.controller;

import com.example.demo.dto.*;
import com.example.demo.entity.Challenge;
import com.example.demo.entity.ExerciseRecord;
import com.example.demo.repository.ChallengeRepository;
import com.example.demo.repository.ExerciseRecordRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/challenges")
@CrossOrigin(origins = "http://13.124.207.117:3000")
public class ChallengeController {

    private static final Logger logger = LoggerFactory.getLogger(ChallengeController.class);
    private final ChallengeRepository challengeRepository;
    private final ExerciseRecordRepository exerciseRecordRepository;

    public ChallengeController(ChallengeRepository challengeRepository, ExerciseRecordRepository exerciseRecordRepository) {
        this.challengeRepository = challengeRepository;
        this.exerciseRecordRepository = exerciseRecordRepository;
    }

    // 챌린지 생성
    @PostMapping
    public ResponseEntity<ChallengeResponse> createChallenge(
            @RequestBody ChallengeRequest request,
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        
        if (userId == null) {
            userId = 1L;
        }
        
        logger.info("📝 챌린지 생성 - userId: {}, name: {}", userId, request.getName());
        
        try {
            Challenge challenge = new Challenge();
            challenge.setUserId(userId);
            challenge.setName(request.getName());
            challenge.setStartDate(request.getStartDate());
            challenge.setEndDate(request.getEndDate());
            challenge.setTargetWeight(request.getTargetWeight());
            challenge.setTargetBodyFatPercentage(request.getTargetBodyFatPercentage());
            challenge.setTargetMuscleMass(request.getTargetMuscleMass());
            challenge.setTargetExerciseDuration(request.getTargetExerciseDuration());
            
            Challenge savedChallenge = challengeRepository.save(challenge);
            logger.info("✅ 챌린지 생성 완료 - id: {}", savedChallenge.getId());
            
            ChallengeResponse response = convertToResponse(savedChallenge);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (Exception e) {
            logger.error("❌ 챌린지 생성 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // 모든 챌린지 조회
    @GetMapping
    public ResponseEntity<List<ChallengeResponse>> getAllChallenges(
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        
        if (userId == null) {
            userId = 1L;
        }
        
        logger.info("📋 모든 챌린지 조회 - userId: {}", userId);
        
        List<Challenge> challenges = challengeRepository.findByUserIdOrderByStartDateDesc(userId);
        List<ChallengeResponse> responses = challenges.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(responses);
    }

    // 챌린지 목표 수정
    @PutMapping("/{id}/targets")
    public ResponseEntity<ChallengeResponse> updateChallengeTargets(
            @PathVariable("id") Long id,
            @RequestBody ChallengeRequest request,
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        
        if (userId == null) {
            userId = 1L;
        }
        
        logger.info("✏️ 챌린지 목표 수정 - challengeId: {}, userId: {}", id, userId);
        
        try {
            Challenge challenge = challengeRepository.findById(id != null ? id : 0L)
                    .orElse(null);
            
            if (challenge == null || !challenge.getUserId().equals(userId)) {
                return ResponseEntity.notFound().build();
            }
            
            // 목표 값만 업데이트 (이름, 날짜는 변경하지 않음)
            // null 값도 명시적으로 업데이트 (값을 지우는 경우)
            challenge.setTargetWeight(request.getTargetWeight());
            challenge.setTargetBodyFatPercentage(request.getTargetBodyFatPercentage());
            challenge.setTargetMuscleMass(request.getTargetMuscleMass());
            challenge.setTargetExerciseDuration(request.getTargetExerciseDuration());
            
            Challenge updatedChallenge = challengeRepository.save(challenge);
            logger.info("✅ 챌린지 목표 수정 완료 - id: {}", updatedChallenge.getId());
            
            ChallengeResponse response = convertToResponse(updatedChallenge);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("❌ 챌린지 목표 수정 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // 챌린지 상세 조회
    @GetMapping("/{id}")
    public ResponseEntity<ChallengeDetailResponse> getChallengeDetail(
            @PathVariable("id") Long id,
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        
        if (userId == null) {
            userId = 1L;
        }
        
        logger.info("📅 챌린지 상세 조회 - challengeId: {}, userId: {}", id, userId);
        
        Challenge challenge = challengeRepository.findById(id != null ? id : 0L)
                .orElse(null);
        
        if (challenge == null || !challenge.getUserId().equals(userId)) {
            return ResponseEntity.notFound().build();
        }
        
        ChallengeDetailResponse response = new ChallengeDetailResponse();
        response.setChallenge(convertToResponse(challenge));
        
        // 기간 내 운동 기록 조회
        List<ExerciseRecord> records = exerciseRecordRepository
                .findByUserIdAndRecordDateBetween(userId, challenge.getStartDate(), challenge.getEndDate());
        
        Map<LocalDate, ExerciseRecord> recordMap = records.stream()
                .collect(Collectors.toMap(ExerciseRecord::getRecordDate, r -> r));
        
        // 일별 진행상황 생성 - 기록이 있는 날짜만, 오늘 이후 날짜는 제외
        List<ChallengeDetailResponse.DailyProgress> dailyProgress = new ArrayList<>();
        LocalDate today = LocalDate.now();
        LocalDate endDate = challenge.getEndDate();
        
        // 오늘 이후 날짜는 제외하고, 기록이 있는 날짜만 추가
        for (Map.Entry<LocalDate, ExerciseRecord> entry : recordMap.entrySet()) {
            LocalDate recordDate = entry.getKey();
            
            // 오늘 이후 날짜는 제외
            if (recordDate.isAfter(today)) {
                continue;
            }
            
            // 챌린지 기간 내의 기록만 포함
            if (recordDate.isBefore(challenge.getStartDate()) || recordDate.isAfter(endDate)) {
                continue;
            }
            
            ExerciseRecord record = entry.getValue();
            
            // 실제 데이터가 있는지 확인 (모든 필드가 null이면 제외)
            if (record.getWeight() == null && 
                record.getBodyFatPercentage() == null && 
                record.getMuscleMass() == null && 
                record.getExerciseDuration() == null) {
                continue;
            }
            
            ChallengeDetailResponse.DailyProgress progress = new ChallengeDetailResponse.DailyProgress();
            progress.setDate(recordDate);
            
            progress.setWeight(record.getWeight());
            progress.setBodyFatPercentage(record.getBodyFatPercentage());
            progress.setMuscleMass(record.getMuscleMass());
            progress.setExerciseDuration(record.getExerciseDuration());
            
            // 성공 여부 판단
            // 체중: 감량 목표 (낮아야 성공) - higherIsBetter = false
            progress.setWeightSuccess(checkSuccess(progress.getWeight(), challenge.getTargetWeight(), false));
            // 체지방률: 감량 목표 (낮아야 성공) - higherIsBetter = false
            progress.setBodyFatSuccess(checkSuccess(progress.getBodyFatPercentage(), challenge.getTargetBodyFatPercentage(), false));
            // 근육량: 증가 목표 (높아야 성공) - higherIsBetter = true
            progress.setMuscleMassSuccess(checkSuccess(progress.getMuscleMass(), challenge.getTargetMuscleMass(), true));
            // 운동시간: 목표보다 많이 (높아야 성공) - higherIsBetter = true
            progress.setExerciseDurationSuccess(checkSuccess(progress.getExerciseDuration() != null ? progress.getExerciseDuration().doubleValue() : null, 
                    challenge.getTargetExerciseDuration() != null ? challenge.getTargetExerciseDuration().doubleValue() : null, true));
            
            dailyProgress.add(progress);
        }
        
        // 날짜순으로 정렬 (오래된 날짜부터)
        dailyProgress.sort((a, b) -> a.getDate().compareTo(b.getDate()));
        
        response.setDailyProgress(dailyProgress);
        
        // 전체 진행상황 계산 - 마지막날 기록과 목표 비교
        ChallengeDetailResponse.OverallProgress overall = new ChallengeDetailResponse.OverallProgress();
        overall.setTotalDays(dailyProgress.size());
        
        // 마지막날 기록 찾기 (이미 날짜순으로 정렬되어 있으므로 마지막 요소)
        ChallengeDetailResponse.DailyProgress lastRecord = null;
        if (!dailyProgress.isEmpty()) {
            lastRecord = dailyProgress.get(dailyProgress.size() - 1);
        }
        
        // 운동시간은 전체 기간 동안 합산
        int totalExerciseDuration = 0;
        for (ChallengeDetailResponse.DailyProgress dp : dailyProgress) {
            if (dp.getExerciseDuration() != null) {
                totalExerciseDuration += dp.getExerciseDuration();
            }
        }
        
        // 마지막날 기록과 목표 비교하여 달성률 계산
        if (lastRecord != null) {
            // 체중: 감량 목표 (목표보다 낮거나 같아야 함) - 달성률 = (실제 / 목표) * 100
            // 목표 70kg, 실제 68kg → 68/70*100 = 97.14% (목표보다 낮으므로 달성)
            // 목표 70kg, 실제 70kg → 70/70*100 = 100% (정확히 달성)
            // 목표 70kg, 실제 72kg → 72/70*100 = 102.86% (목표보다 높으므로 미달성)
            if (lastRecord.getWeight() != null && challenge.getTargetWeight() != null) {
                double weightRate = (lastRecord.getWeight() / challenge.getTargetWeight()) * 100;
                overall.setWeightSuccessRate(weightRate);
                overall.setWeightSuccessCount(lastRecord.getWeight() <= challenge.getTargetWeight() ? 1 : 0);
            } else {
                overall.setWeightSuccessRate(0);
                overall.setWeightSuccessCount(0);
            }
            
            // 체지방률: 감량 목표 (목표보다 낮거나 같아야 함) - 달성률 = (실제 / 목표) * 100
            if (lastRecord.getBodyFatPercentage() != null && challenge.getTargetBodyFatPercentage() != null) {
                double bodyFatRate = (lastRecord.getBodyFatPercentage() / challenge.getTargetBodyFatPercentage()) * 100;
                overall.setBodyFatSuccessRate(bodyFatRate);
                overall.setBodyFatSuccessCount(lastRecord.getBodyFatPercentage() <= challenge.getTargetBodyFatPercentage() ? 1 : 0);
            } else {
                overall.setBodyFatSuccessRate(0);
                overall.setBodyFatSuccessCount(0);
            }
            
            // 근육량: 증가 목표 (목표보다 높거나 같아야 함) - 달성률 = (실제 / 목표) * 100
            if (lastRecord.getMuscleMass() != null && challenge.getTargetMuscleMass() != null) {
                double muscleMassRate = (lastRecord.getMuscleMass() / challenge.getTargetMuscleMass()) * 100;
                overall.setMuscleMassSuccessRate(muscleMassRate);
                overall.setMuscleMassSuccessCount(lastRecord.getMuscleMass() >= challenge.getTargetMuscleMass() ? 1 : 0);
            } else {
                overall.setMuscleMassSuccessRate(0);
                overall.setMuscleMassSuccessCount(0);
            }
            
        } else {
            overall.setWeightSuccessRate(0);
            overall.setBodyFatSuccessRate(0);
            overall.setMuscleMassSuccessRate(0);
            overall.setWeightSuccessCount(0);
            overall.setBodyFatSuccessCount(0);
            overall.setMuscleMassSuccessCount(0);
        }
        
        // 운동시간: 전체 기간 합산과 목표 비교 - 달성률 = (실제 합계 / 목표) * 100
        if (challenge.getTargetExerciseDuration() != null && challenge.getTargetExerciseDuration() > 0) {
            double exerciseDurationRate = ((double) totalExerciseDuration / challenge.getTargetExerciseDuration()) * 100;
            overall.setExerciseDurationSuccessRate(exerciseDurationRate);
            overall.setExerciseDurationSuccessCount(totalExerciseDuration >= challenge.getTargetExerciseDuration() ? 1 : 0);
        } else {
            overall.setExerciseDurationSuccessRate(0);
            overall.setExerciseDurationSuccessCount(0);
        }
        
        // 기록이 있는 날짜 수는 마지막날 기록 기준으로 1로 설정 (표시용)
        overall.setWeightRecordedDays(lastRecord != null && lastRecord.getWeight() != null ? 1 : 0);
        overall.setBodyFatRecordedDays(lastRecord != null && lastRecord.getBodyFatPercentage() != null ? 1 : 0);
        overall.setMuscleMassRecordedDays(lastRecord != null && lastRecord.getMuscleMass() != null ? 1 : 0);
        overall.setExerciseDurationRecordedDays(totalExerciseDuration > 0 ? 1 : 0);
        
        response.setOverallProgress(overall);
        
        return ResponseEntity.ok(response);
    }

    private boolean checkSuccess(Double actual, Double target, boolean higherIsBetter) {
        if (actual == null || target == null) {
            return false;
        }
        
        if (higherIsBetter) {
            return actual >= target;
        } else {
            return actual <= target;
        }
    }

    private ChallengeResponse convertToResponse(Challenge challenge) {
        ChallengeResponse response = new ChallengeResponse();
        response.setId(challenge.getId());
        response.setUserId(challenge.getUserId());
        response.setName(challenge.getName());
        response.setStartDate(challenge.getStartDate());
        response.setEndDate(challenge.getEndDate());
        response.setTargetWeight(challenge.getTargetWeight());
        response.setTargetBodyFatPercentage(challenge.getTargetBodyFatPercentage());
        response.setTargetMuscleMass(challenge.getTargetMuscleMass());
        response.setTargetExerciseDuration(challenge.getTargetExerciseDuration());
        response.setCreatedAt(challenge.getCreatedAt());
        response.setUpdatedAt(challenge.getUpdatedAt());
        
        // 진행중인 챌린지: 시작일 <= 오늘 <= 종료일 (종료일 당일 포함)
        LocalDate today = LocalDate.now();
        // 시작일 체크: 오늘이 시작일과 같거나 이후
        boolean afterOrEqualStart = !today.isBefore(challenge.getStartDate());
        // 종료일 체크: 오늘이 종료일과 같거나 이전 (종료일 당일 포함)
        boolean beforeOrEqualEnd = !today.isAfter(challenge.getEndDate());
        boolean isActive = afterOrEqualStart && beforeOrEqualEnd;
        response.setActive(isActive);
        
        logger.info("챌린지 활성 상태 확인 - name: {}, startDate: {}, endDate: {}, today: {}, isActive: {}", 
                     challenge.getName(), challenge.getStartDate(), challenge.getEndDate(), today, isActive);
        
        return response;
    }
}

