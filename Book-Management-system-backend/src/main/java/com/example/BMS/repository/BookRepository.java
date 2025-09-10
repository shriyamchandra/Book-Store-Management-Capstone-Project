package com.example.BMS.repository;

import com.example.BMS.model.Book;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface BookRepository extends JpaRepository<Book, Long> {

    @Query("SELECT b FROM Book b WHERE LOWER(b.title) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(b.author) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Book> searchBooks(@Param("query") String query);

  // THIS IS THE NEW METHOD YOU NEED TO ADD 👇
  @Query("SELECT od.book FROM OrderDetails od GROUP BY od.book ORDER BY SUM(od.quantity) DESC")
  List<Book> findBestSellingBooks(Pageable pageable);
}