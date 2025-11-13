package com.example.demo.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SignupRequest {
    private String username;
    private String password;
    private String name;
    private String email;
    private String birthDate;  // YYYY-MM-DD 형식
    private String gender;     // MALE, FEMALE, OTHER
}



