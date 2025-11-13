package com.example.demo.config;

import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;

    // Spring 4.3+ 부터 생성자가 하나면 @Autowired 생략 가능 (최신 베스트 프랙티스)
    public DataInitializer(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public void run(String... args) {
        // 테스트용 사용자 생성 (이미 존재하면 생성하지 않음)
        if (!userRepository.existsByUsername("admin")) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword("admin123"); // 실제 운영 환경에서는 암호화 필요
            admin.setEmail("admin@example.com");
            admin.setName("관리자");
            userRepository.save(admin);
            System.out.println("✅ 테스트 사용자 생성 완료: admin / admin123");
        }

        if (!userRepository.existsByUsername("user")) {
            User user = new User();
            user.setUsername("user");
            user.setPassword("user123"); // 실제 운영 환경에서는 암호화 필요
            user.setEmail("user@example.com");
            user.setName("일반사용자");
            userRepository.save(user);
            System.out.println("✅ 테스트 사용자 생성 완료: user / user123");
        }
    }
}


