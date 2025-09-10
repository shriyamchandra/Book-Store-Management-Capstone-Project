package com.example.BMS.dto;

import lombok.Data;

@Data
public class RegisterDto {
    // For the User entity
    private String email;
    private String password;

    // For the Customer entity
    private String fullName;
    private String mobileNumber;
}