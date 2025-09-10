package com.example.BMS.service;

import com.example.BMS.dto.BookDetailDto;
import com.example.BMS.exception.ResourceNotFoundException;
import com.example.BMS.model.Book;
import com.example.BMS.repository.BookRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BookService {

    @Autowired
    private BookRepository bookRepository;

    public List<Book> getAllBooks() {
        return bookRepository.findAll();
    }

    // --- THIS IS THE UPDATED METHOD ---
    public BookDetailDto getBookById(Long id) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + id));
        // Create the DTO to include reviews
        return new BookDetailDto(book);
    }

    public Book createBook(Book book) {
        return bookRepository.save(book);
    }

    public Book updateBook(Long id, Book bookDetails) {
        Book existingBook = bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + id));

        existingBook.setTitle(bookDetails.getTitle());
        existingBook.setAuthor(bookDetails.getAuthor());
        existingBook.setIsbn(bookDetails.getIsbn());
        existingBook.setPrice(bookDetails.getPrice());
        existingBook.setQuantityInStock(bookDetails.getQuantityInStock());
        existingBook.setImageUrl(bookDetails.getImageUrl());
        existingBook.setDescription(bookDetails.getDescription());

        return bookRepository.save(existingBook);
    }

    public void deleteBook(Long id) {
        Book existingBook = bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + id));
        bookRepository.delete(existingBook);
    }

    public List<Book> getBestSellingBooks() {
        Pageable topFour = PageRequest.of(0, 4);
        return bookRepository.findBestSellingBooks(topFour);
    }

    public List<Book> searchBooks(String query) {
        return bookRepository.searchBooks(query);
    }
}