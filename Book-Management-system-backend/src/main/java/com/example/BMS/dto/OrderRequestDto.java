package com.example.BMS.dto;

import lombok.Data;
import java.util.List;

@Data
public class OrderRequestDto {
  private String paymentMethod;
  private String recipientName;
  private String recipientPhone;
  // We can add address details here later
  private List<OrderItemDto> items;
}