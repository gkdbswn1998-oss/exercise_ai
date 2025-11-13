package com.example.demo.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginResponse {
    private boolean success;
    private String message;
    private String token;
    private UserInfo user;

    @Getter
    @Setter
    public static class UserInfo {
        private Long id;
        private String username;
        private String email;
        private String name;
    }
}




