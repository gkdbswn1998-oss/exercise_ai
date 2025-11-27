package com.example.demo.controller;

import com.example.demo.dto.*;
import com.example.demo.entity.Routine;
import com.example.demo.entity.RoutineCheck;
import com.example.demo.repository.RoutineRepository;
import com.example.demo.repository.RoutineCheckRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
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
@RequestMapping("/api/routines")
@CrossOrigin(origins = "http://13.124.207.117:3000")
public class RoutineController {

    private static final Logger logger = LoggerFactory.getLogger(RoutineController.class);
    private final RoutineRepository routineRepository;
    private final RoutineCheckRepository routineCheckRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public RoutineController(RoutineRepository routineRepository, RoutineCheckRepository routineCheckRepository) {
        this.routineRepository = routineRepository;
        this.routineCheckRepository = routineCheckRepository;
    }

    // 루틴 조회 (사용자의 모든 루틴)
    @GetMapping
    public ResponseEntity<List<RoutineResponse>> getRoutines(
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        
        if (userId == null) {
            userId = 1L;
        }
        
        logger.info("📋 루틴 조회 - userId: {}", userId);
        
        List<Routine> routines = routineRepository.findByUserId(userId);
        List<RoutineResponse> responses = routines.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(responses);
    }

    // 특정 타입의 루틴 조회
    @GetMapping("/{routineType}")
    public ResponseEntity<RoutineResponse> getRoutineByType(
            @PathVariable("routineType") String routineType,
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        
        if (userId == null) {
            userId = 1L;
        }
        
        logger.info("📋 루틴 조회 - userId: {}, type: {}", userId, routineType);
        
        Optional<Routine> routineOpt = routineRepository.findByUserIdAndRoutineType(userId, routineType.toUpperCase());
        
        if (routineOpt.isPresent()) {
            RoutineResponse response = convertToResponse(routineOpt.get());
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // 루틴 저장 또는 수정
    @PostMapping
    public ResponseEntity<RoutineResponse> saveOrUpdateRoutine(
            @RequestBody RoutineRequest request,
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        
        if (userId == null) {
            userId = 1L;
        }
        
        logger.info("💾 루틴 저장/수정 - userId: {}, type: {}", userId, request.getRoutineType());
        
        try {
            Optional<Routine> existingRoutine = routineRepository.findByUserIdAndRoutineType(
                    userId, request.getRoutineType().toUpperCase());
            
            Routine routine;
            if (existingRoutine.isPresent()) {
                routine = existingRoutine.get();
                logger.info("✏️ 기존 루틴 수정 - id: {}", routine.getId());
            } else {
                routine = new Routine();
                routine.setUserId(userId);
                routine.setRoutineType(request.getRoutineType().toUpperCase());
                logger.info("➕ 새 루틴 생성");
            }
            
            // JSON 문자열로 변환
            String routineItemsJson = objectMapper.writeValueAsString(request.getRoutineItems());
            routine.setRoutineItems(routineItemsJson);
            
            Routine savedRoutine = routineRepository.save(routine);
            logger.info("✅ 루틴 저장 완료 - id: {}", savedRoutine.getId());
            
            RoutineResponse response = convertToResponse(savedRoutine);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("❌ 루틴 저장 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // 루틴 체크 조회 (특정 날짜)
    @GetMapping("/checks/{date}")
    public ResponseEntity<List<RoutineCheckResponse>> getRoutineChecksByDate(
            @PathVariable("date") String date,
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        
        if (userId == null) {
            userId = 1L;
        }
        
        LocalDate checkDate = LocalDate.parse(date);
        logger.info("📅 루틴 체크 조회 - userId: {}, date: {}", userId, checkDate);
        
        List<RoutineCheck> checks = routineCheckRepository.findByUserIdAndCheckDate(userId, checkDate);
        List<RoutineCheckResponse> responses = checks.stream()
                .map(this::convertCheckToResponse)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(responses);
    }

    // 루틴 체크 저장 또는 수정
    @PostMapping("/checks")
    public ResponseEntity<RoutineCheckResponse> saveOrUpdateRoutineCheck(
            @RequestBody RoutineCheckRequest request,
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        
        if (userId == null) {
            userId = 1L;
        }
        
        logger.info("💾 루틴 체크 저장/수정 - userId: {}, date: {}, type: {}", 
                userId, request.getCheckDate(), request.getRoutineType());
        
        try {
            Optional<RoutineCheck> existingCheck = routineCheckRepository.findByUserIdAndCheckDateAndRoutineType(
                    userId, request.getCheckDate(), request.getRoutineType().toUpperCase());
            
            RoutineCheck check;
            if (existingCheck.isPresent()) {
                check = existingCheck.get();
                logger.info("✏️ 기존 루틴 체크 수정 - id: {}", check.getId());
            } else {
                check = new RoutineCheck();
                check.setUserId(userId);
                check.setCheckDate(request.getCheckDate());
                check.setRoutineType(request.getRoutineType().toUpperCase());
                logger.info("➕ 새 루틴 체크 생성");
            }
            
            // JSON 문자열로 변환
            String checkedItemsJson = objectMapper.writeValueAsString(request.getCheckedItems());
            check.setCheckedItems(checkedItemsJson);
            
            RoutineCheck savedCheck = routineCheckRepository.save(check);
            logger.info("✅ 루틴 체크 저장 완료 - id: {}", savedCheck.getId());
            
            RoutineCheckResponse response = convertCheckToResponse(savedCheck);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("❌ 루틴 체크 저장 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    private RoutineResponse convertToResponse(Routine routine) {
        RoutineResponse response = new RoutineResponse();
        response.setId(routine.getId());
        response.setUserId(routine.getUserId());
        response.setRoutineType(routine.getRoutineType());
        response.setCreatedAt(routine.getCreatedAt());
        response.setUpdatedAt(routine.getUpdatedAt());
        
        try {
            List<String> items = objectMapper.readValue(routine.getRoutineItems(), 
                    new TypeReference<List<String>>() {});
            response.setRoutineItems(items);
        } catch (Exception e) {
            logger.error("JSON 파싱 오류", e);
            response.setRoutineItems(List.of());
        }
        
        return response;
    }

    private RoutineCheckResponse convertCheckToResponse(RoutineCheck check) {
        RoutineCheckResponse response = new RoutineCheckResponse();
        response.setId(check.getId());
        response.setUserId(check.getUserId());
        response.setCheckDate(check.getCheckDate());
        response.setRoutineType(check.getRoutineType());
        response.setCreatedAt(check.getCreatedAt());
        response.setUpdatedAt(check.getUpdatedAt());
        
        try {
            List<String> items = objectMapper.readValue(check.getCheckedItems(), 
                    new TypeReference<List<String>>() {});
            response.setCheckedItems(items);
        } catch (Exception e) {
            logger.error("JSON 파싱 오류", e);
            response.setCheckedItems(List.of());
        }
        
        return response;
    }
}

