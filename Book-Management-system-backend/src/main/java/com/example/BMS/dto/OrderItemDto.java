package com.example.BMS.dto;

import lombok.Data;

@Data
public class OrderItemDto {
  private Long bookId;
  private int quantity;
  private String title;
  private String author;
  private String imageUrl;
  private double price;
  private int quantityInStock; // <-- Added this
}