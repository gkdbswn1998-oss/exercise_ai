package com.example.demo.controller;

import com.example.demo.dto.*;
import com.example.demo.entity.Challenge;
import com.example.demo.entity.ChallengeShare;
import com.example.demo.entity.ExerciseRecord;
import com.example.demo.entity.User;
import com.example.demo.repository.ChallengeRepository;
import com.example.demo.repository.ChallengeShareRepository;
import com.example.demo.repository.ExerciseRecordRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.repository.RoutineRepository;
import com.example.demo.repository.RoutineCheckRepository;
import com.example.demo.entity.Routine;
import com.example.demo.entity.RoutineCheck;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/challenge-shares")
@CrossOrigin(origins = "http://localhost:3000")
public class ChallengeShareController {

    private static final Logger logger = LoggerFactory.getLogger(ChallengeShareController.class);
    private final ChallengeShareRepository challengeShareRepository;
    private final ChallengeRepository challengeRepository;
    private final UserRepository userRepository;
    private final ExerciseRecordRepository exerciseRecordRepository;
    private final RoutineRepository routineRepository;
    private final RoutineCheckRepository routineCheckRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public ChallengeShareController(
            ChallengeShareRepository challengeShareRepository,
            ChallengeRepository challengeRepository,
            UserRepository userRepository,
            ExerciseRecordRepository exerciseRecordRepository,
            RoutineRepository routineRepository,
            RoutineCheckRepository routineCheckRepository) {
        this.challengeShareRepository = challengeShareRepository;
        this.challengeRepository = challengeRepository;
        this.userRepository = userRepository;
        this.exerciseRecordRepository = exerciseRecordRepository;
        this.routineRepository = routineRepository;
        this.routineCheckRepository = routineCheckRepository;
    }

    // 사용자 검색 (ID 또는 username으로)
    @GetMapping("/users/search")
    public ResponseEntity<List<UserSearchResponse>> searchUsers(
            @RequestParam(value = "query", required = false) String query,
            @RequestHeader(value = "X-User-Id", required = false) Long currentUserId) {
        
        final Long finalUserId = currentUserId != null ? currentUserId : 1L;

        logger.info("🔍 사용자 검색 - query: {}, currentUserId: {}", query, finalUserId);

        List<User> users;
        if (query == null || query.trim().isEmpty()) {
            // 검색어가 없으면 모든 사용자 반환 (자신 제외)
            users = userRepository.findAll().stream()
                    .filter(u -> !u.getId().equals(finalUserId))
                    .collect(Collectors.toList());
        } else {
            // ID 또는 username으로 검색
            try {
                Long userId = Long.parseLong(query);
                users = userRepository.findAll().stream()
                        .filter(u -> u.getId().equals(userId) && !u.getId().equals(finalUserId))
                        .collect(Collectors.toList());
            } catch (NumberFormatException e) {
                // username으로 검색
                users = userRepository.findByUsernameContainingIgnoreCase(query).stream()
                        .filter(u -> !u.getId().equals(finalUserId))
                        .collect(Collectors.toList());
            }
        }

        List<UserSearchResponse> responses = users.stream()
                .map(u -> {
                    UserSearchResponse response = new UserSearchResponse();
                    response.setId(u.getId());
                    response.setUsername(u.getUsername());
                    response.setName(u.getName());
                    return response;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(responses);
    }

    // 공유 요청 생성
    @PostMapping
    public ResponseEntity<ChallengeShareResponse> createShareRequest(
            @RequestBody ChallengeShareRequest request,
            @RequestHeader(value = "X-User-Id", required = false) Long fromUserId) {
        
        if (fromUserId == null) {
            fromUserId = 1L;
        }

        logger.info("📤 공유 요청 생성 - fromUserId: {}, toUserId: {}, challengeId: {}", 
                    fromUserId, request.getToUserId(), request.getChallengeId());

        // 챌린지 소유자 확인
        Optional<Challenge> challengeOpt = challengeRepository.findById(request.getChallengeId() != null ? request.getChallengeId() : 0L);
        if (challengeOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Challenge challenge = challengeOpt.get();
        if (!challenge.getUserId().equals(fromUserId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        // 이미 공유 요청이 있는지 확인
        List<ChallengeShare> existing = challengeShareRepository
                .findByChallengeIdAndToUserIdAndStatus(request.getChallengeId(), request.getToUserId(), "PENDING");
        if (!existing.isEmpty()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }

        // 공유 요청 생성
        ChallengeShare share = new ChallengeShare();
        share.setFromUserId(fromUserId);
        share.setToUserId(request.getToUserId());
        share.setChallengeId(request.getChallengeId());
        share.setStatus("PENDING");

        ChallengeShare saved = challengeShareRepository.save(share);
        logger.info("✅ 공유 요청 생성 완료 - id: {}", saved.getId());

        ChallengeShareResponse response = convertToResponse(saved);
        return ResponseEntity.ok(response);
    }

    // 받은 공유 요청 조회 (대기 중)
    @GetMapping("/received")
    public ResponseEntity<List<ChallengeShareResponse>> getReceivedShares(
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        
        if (userId == null) {
            userId = 1L;
        }

        logger.info("📥 받은 공유 요청 조회 - userId: {}", userId);

        List<ChallengeShare> shares = challengeShareRepository.findByToUserIdAndStatusOrderByCreatedAtDesc(userId, "PENDING");
        List<ChallengeShareResponse> responses = shares.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(responses);
    }

    // 보낸 공유 요청 조회
    @GetMapping("/sent")
    public ResponseEntity<List<ChallengeShareResponse>> getSentShares(
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        
        if (userId == null) {
            userId = 1L;
        }

        logger.info("📤 보낸 공유 요청 조회 - userId: {}", userId);

        List<ChallengeShare> shares = challengeShareRepository.findByFromUserIdOrderByCreatedAtDesc(userId);
        List<ChallengeShareResponse> responses = shares.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(responses);
    }

    // 수락된 공유 조회
    @GetMapping("/accepted")
    public ResponseEntity<List<ChallengeShareResponse>> getAcceptedShares(
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        
        if (userId == null) {
            userId = 1L;
        }

        logger.info("✅ 수락된 공유 조회 - userId: {}", userId);

        List<ChallengeShare> shares = challengeShareRepository.findByToUserIdAndStatus(userId, "ACCEPTED");
        List<ChallengeShareResponse> responses = shares.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(responses);
    }

    // 공유 요청 수락/거절
    @PutMapping("/{id}/status")
    public ResponseEntity<ChallengeShareResponse> updateShareStatus(
            @PathVariable("id") Long id,
            @RequestParam("status") String status,  // ACCEPTED or REJECTED
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        
        if (userId == null) {
            userId = 1L;
        }

        logger.info("🔄 공유 요청 상태 변경 - id: {}, status: {}, userId: {}", id, status, userId);

        Optional<ChallengeShare> shareOpt = challengeShareRepository.findById(id != null ? id : 0L);
        if (shareOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        ChallengeShare share = shareOpt.get();
        if (!share.getToUserId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        if (!share.getStatus().equals("PENDING")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }

        share.setStatus(status);
        ChallengeShare saved = challengeShareRepository.save(share);
        logger.info("✅ 공유 요청 상태 변경 완료 - id: {}, status: {}", saved.getId(), saved.getStatus());

        ChallengeShareResponse response = convertToResponse(saved);
        return ResponseEntity.ok(response);
    }

    // 공유된 챌린지 상세 조회 (목표 대비 차이만 표시)
    @GetMapping("/accepted/{shareId}/detail")
    public ResponseEntity<SharedChallengeDetailResponse> getSharedChallengeDetail(
            @PathVariable("shareId") Long shareId,
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        
        if (userId == null) {
            userId = 1L;
        }

        logger.info("📅 공유된 챌린지 상세 조회 - shareId: {}, userId: {}", shareId, userId);

        Optional<ChallengeShare> shareOpt = challengeShareRepository.findById(shareId != null ? shareId : 0L);
        if (shareOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        ChallengeShare share = shareOpt.get();
        if (!share.getToUserId().equals(userId) || !share.getStatus().equals("ACCEPTED")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Challenge challenge = challengeRepository.findById(share.getChallengeId() != null ? share.getChallengeId() : 0L)
                .orElse(null);
        if (challenge == null) {
            return ResponseEntity.notFound().build();
        }

        SharedChallengeDetailResponse response = new SharedChallengeDetailResponse();
        response.setChallenge(convertChallengeToResponse(challenge));

        // 원래 소유자의 운동 기록 조회
        List<ExerciseRecord> records = exerciseRecordRepository
                .findByUserIdAndRecordDateBetween(share.getFromUserId(), challenge.getStartDate(), challenge.getEndDate());

        Map<LocalDate, ExerciseRecord> recordMap = records.stream()
                .collect(Collectors.toMap(ExerciseRecord::getRecordDate, r -> r));

        // 원래 소유자의 루틴 설정 조회
        Optional<Routine> morningRoutineOpt = routineRepository.findByUserIdAndRoutineType(share.getFromUserId(), "MORNING");
        Optional<Routine> eveningRoutineOpt = routineRepository.findByUserIdAndRoutineType(share.getFromUserId(), "EVENING");
        
        List<String> morningRoutineItems = new ArrayList<>();
        List<String> eveningRoutineItems = new ArrayList<>();
        
        if (morningRoutineOpt.isPresent()) {
            try {
                String itemsJson = morningRoutineOpt.get().getRoutineItems();
                if (itemsJson != null && !itemsJson.isEmpty()) {
                    morningRoutineItems = objectMapper.readValue(itemsJson, new TypeReference<List<String>>() {});
                }
            } catch (Exception e) {
                logger.error("아침루틴 파싱 오류", e);
            }
        }
        
        if (eveningRoutineOpt.isPresent()) {
            try {
                String itemsJson = eveningRoutineOpt.get().getRoutineItems();
                if (itemsJson != null && !itemsJson.isEmpty()) {
                    eveningRoutineItems = objectMapper.readValue(itemsJson, new TypeReference<List<String>>() {});
                }
            } catch (Exception e) {
                logger.error("저녁루틴 파싱 오류", e);
            }
        }

        // 챌린지 기간 동안의 루틴 체크 데이터 조회
        List<RoutineCheck> routineChecks = routineCheckRepository
                .findByUserIdAndCheckDateBetween(share.getFromUserId(), challenge.getStartDate(), challenge.getEndDate());
        
        Map<LocalDate, Map<String, RoutineCheck>> routineCheckMap = routineChecks.stream()
                .collect(Collectors.groupingBy(
                    RoutineCheck::getCheckDate,
                    Collectors.toMap(RoutineCheck::getRoutineType, rc -> rc)
                ));

        // 일별 진행상황 생성 (목표 대비 차이만)
        List<SharedChallengeDetailResponse.DailyProgress> dailyProgress = new ArrayList<>();
        LocalDate currentDate = challenge.getStartDate();
        LocalDate endDate = challenge.getEndDate();

        while (!currentDate.isAfter(endDate)) {
            SharedChallengeDetailResponse.DailyProgress progress = new SharedChallengeDetailResponse.DailyProgress();
            progress.setDate(currentDate);

            ExerciseRecord record = recordMap.get(currentDate);
            if (record != null) {
                // 목표 대비 차이 계산
                if (record.getWeight() != null && challenge.getTargetWeight() != null) {
                    progress.setWeightDiff(record.getWeight() - challenge.getTargetWeight());
                }
                if (record.getBodyFatPercentage() != null && challenge.getTargetBodyFatPercentage() != null) {
                    progress.setBodyFatDiff(record.getBodyFatPercentage() - challenge.getTargetBodyFatPercentage());
                }
                if (record.getMuscleMass() != null && challenge.getTargetMuscleMass() != null) {
                    progress.setMuscleMassDiff(record.getMuscleMass() - challenge.getTargetMuscleMass());
                }
                if (record.getExerciseDuration() != null && challenge.getTargetExerciseDuration() != null) {
                    progress.setExerciseDurationDiff(record.getExerciseDuration() - challenge.getTargetExerciseDuration());
                }
            }

            // 성공 여부 판단
            progress.setWeightSuccess(checkSuccess(record != null ? record.getWeight() : null, challenge.getTargetWeight(), false));
            progress.setBodyFatSuccess(checkSuccess(record != null ? record.getBodyFatPercentage() : null, challenge.getTargetBodyFatPercentage(), false));
            progress.setMuscleMassSuccess(checkSuccess(record != null ? record.getMuscleMass() : null, challenge.getTargetMuscleMass(), true));
            progress.setExerciseDurationSuccess(checkSuccess(record != null && record.getExerciseDuration() != null ? record.getExerciseDuration().doubleValue() : null,
                    challenge.getTargetExerciseDuration() != null ? challenge.getTargetExerciseDuration().doubleValue() : null, true));

            // 루틴 체크 정보 추가
            Map<String, RoutineCheck> dateRoutineChecks = routineCheckMap.getOrDefault(currentDate, new java.util.HashMap<>());
            
            // 아침루틴 정보
            progress.setMorningRoutineTotal(morningRoutineItems.size());
            RoutineCheck morningCheck = dateRoutineChecks.get("MORNING");
            if (morningCheck != null && morningCheck.getCheckedItems() != null && !morningCheck.getCheckedItems().isEmpty()) {
                try {
                    List<String> checkedItems = objectMapper.readValue(morningCheck.getCheckedItems(), new TypeReference<List<String>>() {});
                    progress.setMorningRoutineChecked(checkedItems != null ? checkedItems.size() : 0);
                } catch (Exception e) {
                    progress.setMorningRoutineChecked(0);
                }
            } else {
                progress.setMorningRoutineChecked(0);
            }
            
            // 저녁루틴 정보
            progress.setEveningRoutineTotal(eveningRoutineItems.size());
            RoutineCheck eveningCheck = dateRoutineChecks.get("EVENING");
            if (eveningCheck != null && eveningCheck.getCheckedItems() != null && !eveningCheck.getCheckedItems().isEmpty()) {
                try {
                    List<String> checkedItems = objectMapper.readValue(eveningCheck.getCheckedItems(), new TypeReference<List<String>>() {});
                    progress.setEveningRoutineChecked(checkedItems != null ? checkedItems.size() : 0);
                } catch (Exception e) {
                    progress.setEveningRoutineChecked(0);
                }
            } else {
                progress.setEveningRoutineChecked(0);
            }

            dailyProgress.add(progress);
            currentDate = currentDate.plusDays(1);
        }

        response.setDailyProgress(dailyProgress);

        // 전체 진행상황 계산 (기존 로직과 동일)
        SharedChallengeDetailResponse.OverallProgress overall = new SharedChallengeDetailResponse.OverallProgress();
        overall.setTotalDays(dailyProgress.size());

        int weightSuccess = 0, bodyFatSuccess = 0, muscleMassSuccess = 0,
                exerciseDurationSuccess = 0;
        int weightRecordedDays = 0, bodyFatRecordedDays = 0, muscleMassRecordedDays = 0,
                exerciseDurationRecordedDays = 0;

        for (SharedChallengeDetailResponse.DailyProgress dp : dailyProgress) {
            if (dp.getWeightDiff() != null) {
                weightRecordedDays++;
                if (dp.isWeightSuccess()) weightSuccess++;
            }
            if (dp.getBodyFatDiff() != null) {
                bodyFatRecordedDays++;
                if (dp.isBodyFatSuccess()) bodyFatSuccess++;
            }
            if (dp.getMuscleMassDiff() != null) {
                muscleMassRecordedDays++;
                if (dp.isMuscleMassSuccess()) muscleMassSuccess++;
            }
            if (dp.getExerciseDurationDiff() != null) {
                exerciseDurationRecordedDays++;
                if (dp.isExerciseDurationSuccess()) exerciseDurationSuccess++;
            }
        }

        overall.setWeightSuccessCount(weightSuccess);
        overall.setBodyFatSuccessCount(bodyFatSuccess);
        overall.setMuscleMassSuccessCount(muscleMassSuccess);
        overall.setExerciseDurationSuccessCount(exerciseDurationSuccess);
        overall.setWeightRecordedDays(weightRecordedDays);
        overall.setBodyFatRecordedDays(bodyFatRecordedDays);
        overall.setMuscleMassRecordedDays(muscleMassRecordedDays);
        overall.setExerciseDurationRecordedDays(exerciseDurationRecordedDays);
        overall.setWeightSuccessRate(weightRecordedDays > 0 ? (double) weightSuccess / weightRecordedDays * 100 : 0);
        overall.setBodyFatSuccessRate(bodyFatRecordedDays > 0 ? (double) bodyFatSuccess / bodyFatRecordedDays * 100 : 0);
        overall.setMuscleMassSuccessRate(muscleMassRecordedDays > 0 ? (double) muscleMassSuccess / muscleMassRecordedDays * 100 : 0);
        overall.setExerciseDurationSuccessRate(exerciseDurationRecordedDays > 0 ? (double) exerciseDurationSuccess / exerciseDurationRecordedDays * 100 : 0);

        // 루틴 체크 성공률 계산
        int morningRoutineSuccessDays = 0;
        int eveningRoutineSuccessDays = 0;
        int morningRoutineRecordedDays = 0;
        int eveningRoutineRecordedDays = 0;
        
        for (SharedChallengeDetailResponse.DailyProgress dp : dailyProgress) {
            if (dp.getMorningRoutineTotal() != null && dp.getMorningRoutineTotal() > 0) {
                morningRoutineRecordedDays++;
                if (dp.getMorningRoutineChecked() != null && 
                    dp.getMorningRoutineChecked().equals(dp.getMorningRoutineTotal())) {
                    morningRoutineSuccessDays++;
                }
            }
            if (dp.getEveningRoutineTotal() != null && dp.getEveningRoutineTotal() > 0) {
                eveningRoutineRecordedDays++;
                if (dp.getEveningRoutineChecked() != null && 
                    dp.getEveningRoutineChecked().equals(dp.getEveningRoutineTotal())) {
                    eveningRoutineSuccessDays++;
                }
            }
        }
        
        overall.setMorningRoutineSuccessDays(morningRoutineSuccessDays);
        overall.setEveningRoutineSuccessDays(eveningRoutineSuccessDays);
        overall.setMorningRoutineRecordedDays(morningRoutineRecordedDays);
        overall.setEveningRoutineRecordedDays(eveningRoutineRecordedDays);
        overall.setMorningRoutineSuccessRate(morningRoutineRecordedDays > 0 ? (double) morningRoutineSuccessDays / morningRoutineRecordedDays * 100 : 0);
        overall.setEveningRoutineSuccessRate(eveningRoutineRecordedDays > 0 ? (double) eveningRoutineSuccessDays / eveningRoutineRecordedDays * 100 : 0);

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

    private ChallengeResponse convertChallengeToResponse(Challenge challenge) {
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

        LocalDate today = LocalDate.now();
        boolean isActive = !today.isBefore(challenge.getStartDate()) && !today.isAfter(challenge.getEndDate());
        response.setActive(isActive);

        return response;
    }

    private ChallengeShareResponse convertToResponse(ChallengeShare share) {
        ChallengeShareResponse response = new ChallengeShareResponse();
        response.setId(share.getId());
        response.setFromUserId(share.getFromUserId());
        response.setToUserId(share.getToUserId());
        response.setChallengeId(share.getChallengeId());
        response.setStatus(share.getStatus());
        response.setCreatedAt(share.getCreatedAt());
        response.setUpdatedAt(share.getUpdatedAt());

        // 사용자 이름 조회
        Optional<User> fromUser = userRepository.findById(share.getFromUserId() != null ? share.getFromUserId() : 0L);
        if (fromUser.isPresent()) {
            response.setFromUserName(fromUser.get().getName() != null ? fromUser.get().getName() : fromUser.get().getUsername());
        }

        // 챌린지 이름 조회
        Optional<Challenge> challenge = challengeRepository.findById(share.getChallengeId() != null ? share.getChallengeId() : 0L);
        if (challenge.isPresent()) {
            response.setChallengeName(challenge.get().getName());
        }

        return response;
    }
}

