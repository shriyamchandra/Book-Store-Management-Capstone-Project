package com.example.BMS.repository;

import com.example.BMS.model.BookOrder;
import com.example.BMS.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface BookOrderRepository extends JpaRepository<BookOrder, Long> {

  // New method to find an order by customer and status
  Optional<BookOrder> findByCustomerAndStatus(Customer customer, String status);
}