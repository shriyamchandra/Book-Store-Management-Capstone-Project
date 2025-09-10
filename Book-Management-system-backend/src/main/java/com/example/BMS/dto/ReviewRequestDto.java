package com.example.BMS.dto;

import lombok.Data;

@Data
public class ReviewRequestDto {
    private Long bookId;
    private Integer rating;
    private String comment;
    private String username;
}
