package com.example.BMS.service;

import com.example.BMS.model.Book;
import com.example.BMS.model.Review;
import com.example.BMS.repository.BookRepository;
import com.example.BMS.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.List;

@Service
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private BookRepository bookRepository;

    public Review saveReview(Long bookId, Review review) {
        System.out.println("ReviewService: Attempting to save review for bookId: " + bookId);
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> {
                    System.out.println("ReviewService: Book not found for bookId: " + bookId);
                    return new ResponseStatusException(HttpStatus.NOT_FOUND, "Book not found");
                });
        review.setBook(book);
        Review savedReview = reviewRepository.save(review);
        System.out.println("ReviewService: Review saved: " + savedReview);
        return savedReview;
    }

    public List<Review> getReviewsByBookId(Long bookId) {
        System.out.println("ReviewService: Fetching reviews for bookId: " + bookId);
        List<Review> reviews = reviewRepository.findByBook_BookId(bookId);
        System.out.println("ReviewService: Found " + reviews.size() + " reviews for bookId: " + bookId);
        return reviews;
    }
}
