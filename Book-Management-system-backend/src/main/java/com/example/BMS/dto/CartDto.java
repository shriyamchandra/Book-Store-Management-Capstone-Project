package com.example.BMS.dto;

import lombok.Data;
import java.util.List;

@Data
public class CartDto {
  private Long orderId;
  private double totalAmount;
  private List<OrderItemDto> items;
}