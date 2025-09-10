package com.example.BMS.dto;

import lombok.Data;

@Data
public class LoginDto {
    // This field MUST be named 'email' to match your JSON from Postman
    private String email;

    private String password;
}