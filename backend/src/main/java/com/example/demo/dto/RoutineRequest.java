package com.example.demo.dto;

import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Getter
@Setter
public class RoutineRequest {
    private String routineType;  // "MORNING" or "EVENING"
    private List<String> routineItems;  // ["체중제기", "눈바디기록", "물마시기", "운동하기"]
}

