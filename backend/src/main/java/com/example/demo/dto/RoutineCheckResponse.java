package com.example.demo.dto;

import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
public class RoutineCheckResponse {
    private Long id;
    private Long userId;
    private LocalDate checkDate;
    private String routineType;
    private List<String> checkedItems;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

