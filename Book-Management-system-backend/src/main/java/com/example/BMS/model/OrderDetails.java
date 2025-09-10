package com.example.BMS.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "order_details")
@Data
public class OrderDetails {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long orderDetailsId;

  private int quantity;
  private double subtotal;

  // This detail belongs to one book order
  @ManyToOne
  @JoinColumn(name = "order_id")
  @JsonIgnore // Important to prevent infinite loops
  private BookOrder bookOrder;

  // This detail is for one specific book
  @ManyToOne
  @JoinColumn(name = "book_id")
  private Book book;
}