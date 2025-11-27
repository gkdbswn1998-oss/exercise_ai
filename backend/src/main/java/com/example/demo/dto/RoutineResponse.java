package com.example.demo.dto;

import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
public class RoutineResponse {
    private Long id;
    private Long userId;
    private String routineType;
    private List<String> routineItems;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

