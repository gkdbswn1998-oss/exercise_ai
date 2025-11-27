package com.example.demo.dto;

import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
public class RoutineCheckRequest {
    private LocalDate checkDate;
    private String routineType;  // "MORNING" or "EVENING"
    private List<String> checkedItems;  // 체크된 항목들
}

