package com.example.BMS.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "book_orders")
@Data
public class BookOrder {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long orderId;

  private LocalDate orderDate;
  private double orderTotal;
  private String status;
  private String paymentMethod;
  private String recipientName;
  private String recipientPhone;

  // An order is placed by one customer
  @ManyToOne
  @JoinColumn(name = "customer_id")
  private Customer customer;

  // An order has one shipping address
  @ManyToOne
  @JoinColumn(name = "shipping_address_id")
  private Address shippingAddress;

  // An order consists of a list of order details (the items)
  @OneToMany(mappedBy = "bookOrder", cascade = CascadeType.ALL)
  private List<OrderDetails> orderDetails;
}