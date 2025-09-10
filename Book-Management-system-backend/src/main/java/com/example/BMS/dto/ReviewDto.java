package com.example.BMS.dto;

import lombok.Data;

@Data
public class ReviewDto {
  private String headline;
  private String comment;
  private double rating;
  private Long bookId;
}