package com.example.BMS.controller;

import com.example.BMS.dto.CartDto;
import com.example.BMS.dto.OrderItemDto;
import com.example.BMS.dto.OrderRequestDto;
import com.example.BMS.model.BookOrder;
import com.example.BMS.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

  @Autowired
  private OrderService orderService;

  @PostMapping
  public ResponseEntity<BookOrder> createOrder(@RequestBody OrderRequestDto orderRequest,
      Authentication authentication) {
    String userEmail = authentication.getName();
    BookOrder createdOrder = orderService.createOrder(orderRequest, userEmail);
    return ResponseEntity.ok(createdOrder);
  }

  // Get current user's past orders (excluding IN_CART)
  @GetMapping
  public ResponseEntity<?> getMyOrders(Authentication authentication) {
    String userEmail = authentication.getName();
    return ResponseEntity.ok(orderService.getUserOrders(userEmail));
  }

  // --- NEW ENDPOINT: Get user's cart ---
  @GetMapping("/cart")
  public ResponseEntity<CartDto> getCart(Authentication authentication) {
    String userEmail = authentication.getName();
    return orderService.getCart(userEmail)
        .map(ResponseEntity::ok)
        .orElseGet(() -> ResponseEntity.noContent().build());
  }

  // --- NEW ENDPOINT: Add item to cart ---
  @PostMapping("/cart/items")
  public ResponseEntity<CartDto> addToCart(@RequestBody OrderItemDto itemDto, Authentication authentication) {
    String userEmail = authentication.getName();
    CartDto updatedCart = orderService.addToCart(userEmail, itemDto);
    return ResponseEntity.ok(updatedCart);
  }

  // --- NEW ENDPOINT: Update item quantity ---
  @PutMapping("/cart/items/{bookId}")
  public ResponseEntity<CartDto> updateCartItem(@PathVariable Long bookId, @RequestParam int quantity,
      Authentication authentication) {
    String userEmail = authentication.getName();
    CartDto updatedCart = orderService.updateCartItemQuantity(userEmail, bookId, quantity);
    return ResponseEntity.ok(updatedCart);
  }

  // --- NEW ENDPOINT: Remove item from cart ---
  @DeleteMapping("/cart/items/{bookId}")
  public ResponseEntity<CartDto> removeCartItem(@PathVariable Long bookId, Authentication authentication) {
    String userEmail = authentication.getName();
    CartDto updatedCart = orderService.removeCartItem(userEmail, bookId);
    return ResponseEntity.ok(updatedCart);
  }
}
