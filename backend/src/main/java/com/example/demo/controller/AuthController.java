package com.example.demo.controller;

import com.example.demo.dto.LoginRequest;
import com.example.demo.dto.LoginResponse;
import com.example.demo.dto.SignupRequest;
import com.example.demo.dto.SignupResponse;
import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://13.124.207.117:3000")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);
    private final UserRepository userRepository;

    // Spring 4.3+ 부터 생성자가 하나면 @Autowired 생략 가능 (최신 베스트 프랙티스)
    public AuthController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        logger.info("🔐 로그인 요청 받음 - username: {}", request.getUsername());
        
        try {
            LoginResponse response = new LoginResponse();

            // 사용자 조회
            logger.info("📋 사용자 조회 시작: {}", request.getUsername());
            Optional<User> userOpt = userRepository.findByUsername(request.getUsername());
            logger.info("📋 사용자 조회 완료 - 존재 여부: {}", userOpt.isPresent());

            if (userOpt.isEmpty()) {
                logger.warn("❌ 사용자를 찾을 수 없음: {}", request.getUsername());
                response.setSuccess(false);
                response.setMessage("아이디 또는 비밀번호가 올바르지 않습니다.");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }

            User user = userOpt.get();
            logger.info("👤 사용자 정보 - username: {}, password 길이: {}", 
                       user.getUsername(), user.getPassword() != null ? user.getPassword().length() : 0);

            // 비밀번호 확인 (실제로는 BCrypt 등으로 암호화된 비밀번호를 비교해야 함)
            // 현재는 간단하게 평문 비교 (운영 환경에서는 반드시 암호화 사용)
            logger.info("🔑 비밀번호 확인 중...");
            boolean passwordMatch = user.getPassword().equals(request.getPassword());
            logger.info("🔑 비밀번호 일치 여부: {}", passwordMatch);
            
            if (!passwordMatch) {
                logger.warn("❌ 비밀번호 불일치");
                response.setSuccess(false);
                response.setMessage("아이디 또는 비밀번호가 올바르지 않습니다.");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }

            // 로그인 성공
            logger.info("✅ 로그인 성공: {}", request.getUsername());
            response.setSuccess(true);
            response.setMessage("로그인 성공");
            
            // 간단한 토큰 생성 (실제로는 JWT 사용 권장)
            String token = UUID.randomUUID().toString();
            response.setToken(token);
            logger.info("🎫 토큰 생성 완료");

            // 사용자 정보 설정
            LoginResponse.UserInfo userInfo = new LoginResponse.UserInfo();
            userInfo.setId(user.getId());
            userInfo.setUsername(user.getUsername());
            userInfo.setEmail(user.getEmail());
            userInfo.setName(user.getName());
            response.setUser(userInfo);
            
            logger.info("📤 응답 전송 준비 완료");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("❌ 로그인 처리 중 오류 발생", e);
            LoginResponse errorResponse = new LoginResponse();
            errorResponse.setSuccess(false);
            errorResponse.setMessage("로그인 처리 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @PostMapping("/signup")
    public ResponseEntity<SignupResponse> signup(@RequestBody SignupRequest request) {
        logger.info("📝 회원가입 요청 받음 - username: {}", request.getUsername());
        
        try {
            SignupResponse response = new SignupResponse();

            // 아이디 중복 확인
            if (userRepository.existsByUsername(request.getUsername())) {
                logger.warn("❌ 아이디 중복: {}", request.getUsername());
                response.setSuccess(false);
                response.setMessage("이미 사용 중인 아이디입니다.");
                return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
            }

            // 사용자 생성
            User newUser = new User();
            newUser.setUsername(request.getUsername());
            newUser.setPassword(request.getPassword()); // 실제 운영 환경에서는 BCrypt로 암호화 필요
            newUser.setName(request.getName());
            newUser.setEmail(request.getEmail());
            newUser.setBirthDate(request.getBirthDate());
            newUser.setGender(request.getGender());

            User savedUser = userRepository.save(newUser);
            logger.info("✅ 회원가입 성공 - userId: {}, username: {}", savedUser.getId(), savedUser.getUsername());

            response.setSuccess(true);
            response.setMessage("회원가입이 완료되었습니다.");
            response.setUserId(savedUser.getId());

            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (Exception e) {
            logger.error("❌ 회원가입 처리 중 오류 발생", e);
            SignupResponse errorResponse = new SignupResponse();
            errorResponse.setSuccess(false);
            errorResponse.setMessage("회원가입 처리 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/validate")
    public ResponseEntity<Boolean> validateToken(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        // 간단한 토큰 검증 (실제로는 JWT 검증 로직 필요)
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return ResponseEntity.ok(true);
        }
        return ResponseEntity.ok(false);
    }
}

