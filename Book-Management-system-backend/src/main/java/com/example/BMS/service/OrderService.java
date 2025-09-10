package com.example.BMS.service;

import com.example.BMS.dto.CartDto;
import com.example.BMS.dto.OrderItemDto;
import com.example.BMS.dto.OrderRequestDto;
import com.example.BMS.exception.ResourceNotFoundException;
import com.example.BMS.model.*;
import com.example.BMS.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class OrderService {

  @Autowired
  private UserRepository userRepository;
  @Autowired
  private BookRepository bookRepository;
  @Autowired
  private BookOrderRepository bookOrderRepository;
  @Autowired
  private OrderDetailsRepository orderDetailsRepository;

  @Transactional
  public Optional<CartDto> getCart(String userEmail) {
    User user = findUserByEmail(userEmail);
    Optional<BookOrder> cartOrder = bookOrderRepository.findByCustomerAndStatus(user.getCustomer(), "IN_CART");
    return cartOrder.map(this::mapOrderToCartDto);
  }

  @Transactional
  public CartDto addToCart(String userEmail, OrderItemDto itemDto) {
    User user = findUserByEmail(userEmail);
    Customer customer = user.getCustomer();
    BookOrder cart = bookOrderRepository.findByCustomerAndStatus(customer, "IN_CART")
        .orElseGet(() -> createNewCart(customer));
    Book book = bookRepository.findById(itemDto.getBookId())
        .orElseThrow(() -> new ResourceNotFoundException("Book not found"));

    Optional<OrderDetails> existingDetailOpt = cart.getOrderDetails().stream()
        .filter(detail -> detail.getBook().getBookId().equals(itemDto.getBookId())).findFirst();

    if (existingDetailOpt.isPresent()) {
      OrderDetails detail = existingDetailOpt.get();
      int newQuantity = detail.getQuantity() + itemDto.getQuantity();

      if (book.getQuantityInStock() < newQuantity) {
        throw new RuntimeException(
            "Not enough stock. Only " + book.getQuantityInStock() + " items available in total.");
      }
      detail.setQuantity(newQuantity);
      detail.setSubtotal(newQuantity * book.getPrice());
    } else {
      if (book.getQuantityInStock() < itemDto.getQuantity()) {
        throw new RuntimeException("Not enough stock for book: " + book.getTitle());
      }
      OrderDetails newDetail = new OrderDetails();
      newDetail.setBook(book);
      newDetail.setQuantity(itemDto.getQuantity());
      newDetail.setSubtotal(itemDto.getQuantity() * book.getPrice());
      newDetail.setBookOrder(cart);
      cart.getOrderDetails().add(newDetail);
    }
    cart.setOrderTotal(calculateCartTotal(cart));
    BookOrder savedCart = bookOrderRepository.save(cart);
    return mapOrderToCartDto(savedCart);
  }

  @Transactional
  public CartDto updateCartItemQuantity(String userEmail, Long bookId, int quantity) {
    if (quantity <= 0) {
      return removeCartItem(userEmail, bookId);
    }
    User user = findUserByEmail(userEmail);
    BookOrder cart = bookOrderRepository.findByCustomerAndStatus(user.getCustomer(), "IN_CART")
        .orElseThrow(() -> new ResourceNotFoundException("Cart not found for user"));
    OrderDetails detail = cart.getOrderDetails().stream().filter(d -> d.getBook().getBookId().equals(bookId))
        .findFirst().orElseThrow(() -> new ResourceNotFoundException("Book not in cart"));
    Book book = detail.getBook();
    if (book.getQuantityInStock() < quantity) {
      throw new RuntimeException("Not enough stock. Only " + book.getQuantityInStock() + " items available.");
    }
    detail.setQuantity(quantity);
    detail.setSubtotal(quantity * book.getPrice());
    cart.setOrderTotal(calculateCartTotal(cart));
    BookOrder savedCart = bookOrderRepository.save(cart);
    return mapOrderToCartDto(savedCart);
  }

  @Transactional
  public CartDto removeCartItem(String userEmail, Long bookId) {
    User user = findUserByEmail(userEmail);
    BookOrder cart = bookOrderRepository.findByCustomerAndStatus(user.getCustomer(), "IN_CART")
        .orElseThrow(() -> new ResourceNotFoundException("Cart not found for user"));
    OrderDetails detailToRemove = cart.getOrderDetails().stream().filter(d -> d.getBook().getBookId().equals(bookId))
        .findFirst().orElseThrow(() -> new ResourceNotFoundException("Book not in cart"));
    cart.getOrderDetails().remove(detailToRemove);
    orderDetailsRepository.delete(detailToRemove);
    cart.setOrderTotal(calculateCartTotal(cart));
    BookOrder savedCart = bookOrderRepository.save(cart);
    return mapOrderToCartDto(savedCart);
  }

  @Transactional
  public BookOrder createOrder(OrderRequestDto orderRequest, String userEmail) {
    User user = findUserByEmail(userEmail);
    BookOrder cart = bookOrderRepository.findByCustomerAndStatus(user.getCustomer(), "IN_CART")
        .orElseThrow(() -> new ResourceNotFoundException("Cart is empty"));

    cart.setStatus("COMPLETED");
    cart.setPaymentMethod(orderRequest.getPaymentMethod());
    cart.setRecipientName(orderRequest.getRecipientName());
    cart.setRecipientPhone(orderRequest.getRecipientPhone());

    // Simulation mode: do NOT decrement stock; just finalize the order
    // Keep a completed order record
    BookOrder completed = bookOrderRepository.save(cart);

    // Optionally, create a fresh empty cart for the user for next session
    createNewCart(user.getCustomer());
    return completed;
  }

  @Transactional(readOnly = true)
  public List<BookOrder> getUserOrders(String userEmail) {
    User user = findUserByEmail(userEmail);
    return bookOrderRepository.findByCustomerAndStatusNot(user.getCustomer(), "IN_CART");
  }

  private User findUserByEmail(String email) {
    return userRepository.findByEmail(email)
        .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
  }

  private BookOrder createNewCart(Customer customer) {
    BookOrder cart = new BookOrder();
    cart.setCustomer(customer);
    cart.setStatus("IN_CART");
    cart.setOrderDate(LocalDate.now());
    cart.setOrderDetails(new ArrayList<>());
    return bookOrderRepository.save(cart);
  }

  private double calculateCartTotal(BookOrder cart) {
    return cart.getOrderDetails().stream().mapToDouble(OrderDetails::getSubtotal).sum();
  }

  private CartDto mapOrderToCartDto(BookOrder order) {
    CartDto cartDto = new CartDto();
    cartDto.setOrderId(order.getOrderId());
    cartDto.setTotalAmount(order.getOrderTotal());
    cartDto.setItems(order.getOrderDetails().stream().map(detail -> {
      OrderItemDto itemDto = new OrderItemDto();
      itemDto.setBookId(detail.getBook().getBookId());
      itemDto.setQuantity(detail.getQuantity());
      itemDto.setTitle(detail.getBook().getTitle());
      itemDto.setAuthor(detail.getBook().getAuthor());
      itemDto.setImageUrl(detail.getBook().getImageUrl());
      itemDto.setPrice(detail.getBook().getPrice());
      itemDto.setQuantityInStock(detail.getBook().getQuantityInStock());
      return itemDto;
    }).collect(Collectors.toList()));
    return cartDto;
  }
}
