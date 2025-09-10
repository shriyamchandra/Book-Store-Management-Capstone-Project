package com.example.BMS.controller;

import com.example.BMS.dto.BookDetailDto;
import com.example.BMS.model.Book;
import com.example.BMS.service.BookService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/books")
public class BookController {

  @Autowired
  private BookService bookService;

  @GetMapping
  public List<Book> getAllBooks() {
    return bookService.getAllBooks();
  }

  // --- THIS IS THE UPDATED ENDPOINT ---
  @GetMapping("/{id}")
  public ResponseEntity<BookDetailDto> getBookById(@PathVariable Long id) {
    BookDetailDto bookDetailDto = bookService.getBookById(id);
    return ResponseEntity.ok(bookDetailDto);
  }

  @PostMapping
  public Book createBook(@RequestBody Book book) {
    return bookService.createBook(book);
  }

  @PutMapping("/{id}")
  public Book updateBook(@PathVariable Long id, @RequestBody Book bookDetails) {
    return bookService.updateBook(id, bookDetails);
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<String> deleteBook(@PathVariable Long id) {
    bookService.deleteBook(id);
    return ResponseEntity.ok("Book with ID " + id + " was deleted successfully.");
  }

  @GetMapping("/best-selling")
  public List<Book> getBestSellingBooks() {
    return bookService.getBestSellingBooks();
  }

  @GetMapping("/search")
    public List<Book> searchBooks(@RequestParam("query") String query) {
        return bookService.searchBooks(query);
    }
}