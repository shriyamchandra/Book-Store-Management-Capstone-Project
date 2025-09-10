package com.example.BMS.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ReviewDetailDto {
  private String comment;
  private double rating;
  private LocalDateTime reviewDate;
  private String username;
}