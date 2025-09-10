package com.example.BMS.controller;

import com.example.BMS.model.Book;
import com.example.BMS.model.Customer;
import com.example.BMS.model.Role;
import com.example.BMS.model.User;
import com.example.BMS.repository.BookRepository;
import com.example.BMS.repository.UserRepository;
import com.example.BMS.service.OrderService; // Import OrderService
import com.example.BMS.dto.OrderItemDto; // Import OrderItemDto
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class SecurityIntegrationTest {

  @Autowired
  private MockMvc mockMvc;
  @Autowired
  private BookRepository bookRepository;
  @Autowired
  private UserRepository userRepository;
  @Autowired
  private OrderService orderService; // Inject OrderService

  private Book testBook;

  @BeforeEach
  void setUp() {
    // Create a book
    testBook = new Book();
    testBook.setTitle("The Hobbit");
    testBook.setAuthor("J.R.R. Tolkien");
    testBook.setIsbn("978-0618968633-" + System.currentTimeMillis()); // Make ISBN unique
    testBook.setPrice(19.99);
    testBook.setQuantityInStock(10);
    testBook = bookRepository.saveAndFlush(testBook); // Save and flush to ensure it's committed

    // Create a ROLE_USER
    User user = new User();
    user.setEmail("user@example.com");
    user.setPassword("password"); // doesn’t matter, no login needed
    user.setRole(Role.ROLE_USER);

    Customer customer = new Customer();
    customer.setFullName("Regular User");
    customer.setMobileNumber("1111111111");
    customer.setUser(user);

    user.setCustomer(customer);
    userRepository.save(user);

    // Create a ROLE_ADMIN
    User admin = new User();
    admin.setEmail("admin@example.com");
    admin.setPassword("password");
    admin.setRole(Role.ROLE_USER);

    Customer adminCustomer = new Customer();
    adminCustomer.setFullName("Admin User");
    adminCustomer.setMobileNumber("9999999999");
    adminCustomer.setUser(admin);

    admin.setCustomer(adminCustomer);
    userRepository.save(admin);

    // Add testBook to user's cart
    OrderItemDto userCartItem = new OrderItemDto();
    userCartItem.setBookId(testBook.getBookId());
    userCartItem.setQuantity(1);
    orderService.addToCart(user.getEmail(), userCartItem);

    // Add testBook to admin's cart
    OrderItemDto adminCartItem = new OrderItemDto();
    adminCartItem.setBookId(testBook.getBookId());
    adminCartItem.setQuantity(1);
    orderService.addToCart(admin.getEmail(), adminCartItem);
  }

  // -------------------- BOOK TESTS --------------------
  @Nested
  class BookTests {

    @Test
    void getBooks_Anonymous_ShouldSucceed() throws Exception {
      mockMvc.perform(get("/api/books"))
          .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "USER")
    void postBook_AsUser_ShouldFail() throws Exception {
      String bookJson = """
            { "title": "New Book", "author": "Anon", "isbn": "1111111111111", "price": 15.0 }
          """;
      mockMvc.perform(post("/api/books")
          .contentType(MediaType.APPLICATION_JSON)
          .content(bookJson))
          .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = "ADMIN")
    void deleteBook_AsAdmin_ShouldSucceed() throws Exception {
      mockMvc.perform(delete("/api/books/" + testBook.getBookId()))
          .andExpect(status().isOk());
    }
  }

  // -------------------- REVIEW TESTS --------------------
  @Nested
  class ReviewTests {

    @Test
    @WithMockUser(username = "user@example.com", roles = "USER")
    void postReview_AsUser_ShouldSucceed() throws Exception {
      String reviewJson = """
          {
            "headline": "Great book!",
            "comment": "Really enjoyed it",
            "rating": 5.0,
            "bookId": %d
          }
          """.formatted(testBook.getBookId());

      mockMvc.perform(post("/api/reviews")
          .contentType(MediaType.APPLICATION_JSON)
          .content(reviewJson))
          .andExpect(status().isCreated());
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = "ADMIN")
    void postReview_AsAdmin_ShouldSucceed() throws Exception {
      String reviewJson = """
          {
            "headline": "Admin Review",
            "comment": "Even better on re-read!",
            "rating": 4.5,
            "bookId": %d
          }
          """.formatted(testBook.getBookId());

      mockMvc.perform(post("/api/reviews")
          .contentType(MediaType.APPLICATION_JSON)
          .content(reviewJson))
          .andExpect(status().isCreated());
    }
  }

  // -------------------- ORDER TESTS --------------------
  @Nested
  class OrderTests {

    @Test
    @WithMockUser(username = "user@example.com", roles = "USER")
    void createOrder_AsUser_ShouldSucceed() throws Exception {
      String orderJson = """
          {
            "paymentMethod": "Credit Card",
            "recipientName": "Regular User",
            "recipientPhone": "1111111111",
            "items": [
              { "bookId": %d, "quantity": 2 }
            ]
          }
          """.formatted(testBook.getBookId());

      mockMvc.perform(post("/api/orders")
          .contentType(MediaType.APPLICATION_JSON)
          .content(orderJson))
          .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = "ADMIN")
    void createOrder_AsAdmin_ShouldSucceed() throws Exception {
      String orderJson = """
          {
            "paymentMethod": "PayPal",
            "recipientName": "Admin User",
            "recipientPhone": "9999999999",
            "items": [
              { "bookId": %d, "quantity": 1 }
            ]
          }
          """.formatted(testBook.getBookId());

      mockMvc.perform(post("/api/orders")
          .contentType(MediaType.APPLICATION_JSON)
          .content(orderJson))
          .andExpect(status().isOk());
    }
  }
}