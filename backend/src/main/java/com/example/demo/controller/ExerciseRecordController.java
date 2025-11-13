package com.example.demo.controller;

import com.example.demo.dto.ExerciseRecordRequest;
import com.example.demo.dto.ExerciseRecordResponse;
import com.example.demo.entity.ExerciseRecord;
import com.example.demo.repository.ExerciseRecordRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/exercise-records")
@CrossOrigin(origins = "http://localhost:3000")
public class ExerciseRecordController {

    private static final Logger logger = LoggerFactory.getLogger(ExerciseRecordController.class);
    private final ExerciseRecordRepository exerciseRecordRepository;

    public ExerciseRecordController(ExerciseRecordRepository exerciseRecordRepository) {
        this.exerciseRecordRepository = exerciseRecordRepository;
    }

    // 특정 날짜의 기록 조회 (또는 생성)
    @GetMapping("/date/{date}")
    public ResponseEntity<ExerciseRecordResponse> getRecordByDate(
            @PathVariable String date,
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        
        // 임시로 userId를 1로 설정 (실제로는 토큰에서 가져와야 함)
        if (userId == null) {
            userId = 1L;
        }
        
        LocalDate recordDate = LocalDate.parse(date);
        logger.info("📅 기록 조회 - userId: {}, date: {}", userId, recordDate);
        
        Optional<ExerciseRecord> recordOpt = exerciseRecordRepository.findByUserIdAndRecordDate(userId, recordDate);
        
        if (recordOpt.isPresent()) {
            ExerciseRecordResponse response = convertToResponse(recordOpt.get());
            return ResponseEntity.ok(response);
        } else {
            // 기록이 없으면 204 No Content 반환
            return ResponseEntity.noContent().build();
        }
    }

    // 기록 저장 또는 수정
    @PostMapping
    public ResponseEntity<ExerciseRecordResponse> saveOrUpdateRecord(
            @RequestBody ExerciseRecordRequest request,
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        
        // 임시로 userId를 1로 설정 (실제로는 토큰에서 가져와야 함)
        if (userId == null) {
            userId = 1L;
        }
        
        logger.info("💾 기록 저장/수정 - userId: {}, date: {}", userId, request.getRecordDate());
        
        try {
            // 기존 기록 확인
            Optional<ExerciseRecord> existingRecord = exerciseRecordRepository
                    .findByUserIdAndRecordDate(userId, request.getRecordDate());
            
            ExerciseRecord record;
            if (existingRecord.isPresent()) {
                // 수정
                record = existingRecord.get();
                logger.info("✏️ 기존 기록 수정 - id: {}", record.getId());
            } else {
                // 새로 생성
                record = new ExerciseRecord();
                record.setUserId(userId);
                record.setRecordDate(request.getRecordDate());
                logger.info("➕ 새 기록 생성");
            }
            
            // 데이터 업데이트
            record.setWeight(request.getWeight());
            record.setBodyFatPercentage(request.getBodyFatPercentage());
            record.setMuscleMass(request.getMuscleMass());
            record.setMusclePercentage(request.getMusclePercentage());
            record.setExerciseType(request.getExerciseType());
            record.setExerciseDuration(request.getExerciseDuration());
            
            ExerciseRecord savedRecord = exerciseRecordRepository.save(record);
            logger.info("✅ 기록 저장 완료 - id: {}", savedRecord.getId());
            
            ExerciseRecordResponse response = convertToResponse(savedRecord);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("❌ 기록 저장 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // 사용자의 모든 기록 조회
    @GetMapping
    public ResponseEntity<List<ExerciseRecordResponse>> getAllRecords(
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        
        // 임시로 userId를 1로 설정
        if (userId == null) {
            userId = 1L;
        }
        
        logger.info("📋 모든 기록 조회 - userId: {}", userId);
        
        List<ExerciseRecord> records = exerciseRecordRepository.findByUserIdOrderByRecordDateDesc(userId);
        List<ExerciseRecordResponse> responses = records.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(responses);
    }

    // 기간별 기록 조회
    @GetMapping("/range")
    public ResponseEntity<List<ExerciseRecordResponse>> getRecordsByDateRange(
            @RequestParam String startDate,
            @RequestParam String endDate,
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        
        // 임시로 userId를 1로 설정
        if (userId == null) {
            userId = 1L;
        }
        
        LocalDate start = LocalDate.parse(startDate);
        LocalDate end = LocalDate.parse(endDate);
        
        logger.info("📅 기간별 기록 조회 - userId: {}, startDate: {}, endDate: {}", userId, start, end);
        
        List<ExerciseRecord> records = exerciseRecordRepository.findByUserIdAndRecordDateBetween(userId, start, end);
        List<ExerciseRecordResponse> responses = records.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(responses);
    }

    private ExerciseRecordResponse convertToResponse(ExerciseRecord record) {
        ExerciseRecordResponse response = new ExerciseRecordResponse();
        response.setId(record.getId());
        response.setUserId(record.getUserId());
        response.setRecordDate(record.getRecordDate());
        response.setWeight(record.getWeight());
        response.setBodyFatPercentage(record.getBodyFatPercentage());
        response.setMuscleMass(record.getMuscleMass());
        response.setMusclePercentage(record.getMusclePercentage());
        response.setExerciseType(record.getExerciseType());
        response.setExerciseDuration(record.getExerciseDuration());
        response.setCreatedAt(record.getCreatedAt());
        response.setUpdatedAt(record.getUpdatedAt());
        return response;
    }
}

