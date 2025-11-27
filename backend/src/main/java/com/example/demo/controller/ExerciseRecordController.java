package com.example.demo.controller;

import com.example.demo.dto.ExerciseRecordRequest;
import com.example.demo.dto.ExerciseRecordResponse;
import com.example.demo.entity.ExerciseRecord;
import com.example.demo.repository.ExerciseRecordRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/exercise-records")
@CrossOrigin(origins = "http://13.124.207.117:3000")
public class ExerciseRecordController {

    private static final Logger logger = LoggerFactory.getLogger(ExerciseRecordController.class);
    private final ExerciseRecordRepository exerciseRecordRepository;
    
    @Value("${file.upload-dir:uploads/images}")
    private String uploadDir;

    public ExerciseRecordController(ExerciseRecordRepository exerciseRecordRepository) {
        this.exerciseRecordRepository = exerciseRecordRepository;
    }

    // 특정 날짜의 기록 조회 (또는 생성)
    @GetMapping("/date/{date}")
    public ResponseEntity<ExerciseRecordResponse> getRecordByDate(
            @PathVariable("date") String date,
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
            record.setExerciseType(request.getExerciseType());
            record.setExerciseDuration(request.getExerciseDuration());
            record.setImageUrl(request.getImageUrl());
            
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
            @RequestParam("startDate") String startDate,
            @RequestParam("endDate") String endDate,
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

    // 단일 파일 업로드 엔드포인트 (하위 호환성)
    @PostMapping("/upload")
    public ResponseEntity<String> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        
        if (userId == null) {
            userId = 1L;
        }
        
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("파일이 비어있습니다.");
        }
        
        try {
            // 업로드 디렉토리 생성
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            
            // 고유한 파일명 생성
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String filename = UUID.randomUUID().toString() + extension;
            Path filePath = uploadPath.resolve(filename);
            
            // 파일 저장
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            
            // 파일 URL 반환 (프론트엔드에서 접근 가능한 경로)
            String fileUrl = "/api/exercise-records/images/" + filename;
            logger.info("✅ 파일 업로드 완료 - userId: {}, filename: {}", userId, filename);
            
            return ResponseEntity.ok(fileUrl);
            
        } catch (IOException e) {
            logger.error("❌ 파일 업로드 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("파일 업로드에 실패했습니다.");
        }
    }
    
    // 여러 파일 업로드 엔드포인트
    @PostMapping("/upload-multiple")
    public ResponseEntity<List<String>> uploadMultipleFiles(
            @RequestParam("files") MultipartFile[] files,
            @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        
        if (userId == null) {
            userId = 1L;
        }
        
        if (files == null || files.length == 0) {
            return ResponseEntity.badRequest().build();
        }
        
        List<String> uploadedUrls = new java.util.ArrayList<>();
        
        try {
            // 업로드 디렉토리 생성
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            
            for (MultipartFile file : files) {
                if (file.isEmpty()) {
                    continue;
                }
                
                // 고유한 파일명 생성
                String originalFilename = file.getOriginalFilename();
                String extension = "";
                if (originalFilename != null && originalFilename.contains(".")) {
                    extension = originalFilename.substring(originalFilename.lastIndexOf("."));
                }
                String filename = UUID.randomUUID().toString() + extension;
                Path filePath = uploadPath.resolve(filename);
                
                // 파일 저장
                Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
                
                // 파일 URL 추가
                String fileUrl = "/api/exercise-records/images/" + filename;
                uploadedUrls.add(fileUrl);
                logger.info("✅ 파일 업로드 완료 - userId: {}, filename: {}", userId, filename);
            }
            
            return ResponseEntity.ok(uploadedUrls);
            
        } catch (IOException e) {
            logger.error("❌ 파일 업로드 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // 이미지 파일 조회 엔드포인트
    @GetMapping("/images/{filename:.+}")
    @SuppressWarnings("null")
    public ResponseEntity<Resource> getImage(@PathVariable("filename") String filename) {
        try {
            Path filePath = Paths.get(uploadDir).resolve(filename).normalize();
            java.net.URI uri = filePath.toAbsolutePath().toUri();
            Resource resource = new UrlResource(uri);
            
            if (resource.exists() && resource.isReadable()) {
                String contentType = "image/jpeg"; // 기본값
                try {
                    contentType = Files.probeContentType(filePath);
                    if (contentType == null) {
                        contentType = "application/octet-stream";
                    }
                } catch (IOException e) {
                    logger.warn("파일 타입 확인 실패: {}", filename);
                }
                
                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            logger.error("이미지 조회 중 오류 발생: {}", filename, e);
            return ResponseEntity.notFound().build();
        }
    }

    private ExerciseRecordResponse convertToResponse(ExerciseRecord record) {
        ExerciseRecordResponse response = new ExerciseRecordResponse();
        response.setId(record.getId());
        response.setUserId(record.getUserId());
        response.setRecordDate(record.getRecordDate());
        response.setWeight(record.getWeight());
        response.setBodyFatPercentage(record.getBodyFatPercentage());
        response.setMuscleMass(record.getMuscleMass());
        response.setExerciseType(record.getExerciseType());
        response.setExerciseDuration(record.getExerciseDuration());
        response.setImageUrl(record.getImageUrl());
        response.setCreatedAt(record.getCreatedAt());
        response.setUpdatedAt(record.getUpdatedAt());
        return response;
    }
}

