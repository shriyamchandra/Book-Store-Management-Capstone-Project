package com.example.BMS.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "reviews")
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long reviewId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_id", nullable = false) // This column will store the foreign key
    private Book book;

    private Integer rating;
    private String comment;
    private String username; // Assuming this comes from authenticated user or default
    private LocalDateTime reviewDate;

    // Constructors
    public Review() {
    }

    public Review(Book book, Integer rating, String comment, String username, LocalDateTime reviewDate) {
        this.book = book;
        this.rating = rating;
        this.comment = comment;
        this.username = username;
        this.reviewDate = reviewDate;
    }

    // Getters and Setters
    public Long getReviewId() {
        return reviewId;
    }

    public void setReviewId(Long reviewId) {
        this.reviewId = reviewId;
    }

    public Book getBook() {
        return book;
    }

    public void setBook(Book book) {
        this.book = book;
    }

    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public LocalDateTime getReviewDate() {
        return reviewDate;
    }

    public void setReviewDate(LocalDateTime reviewDate) {
        this.reviewDate = reviewDate;
    }

    @PrePersist
    protected void onCreate() {
        reviewDate = LocalDateTime.now();
    }
}
