package com.example.BMS.dto;

import com.example.BMS.model.Book;
import lombok.Data;
import java.util.List;
import java.util.stream.Collectors;

@Data
public class BookDetailDto {
  private Book book;
  private List<ReviewDetailDto> reviews;

  public BookDetailDto(Book book) {
    this.book = book;
    // Ensure description is explicitly set if it's not automatically mapped
    // This might be redundant if Lombok's @Data handles it, but ensures it.
    this.book.setDescription(book.getDescription());
    this.reviews = book.getReviews().stream().map(review -> {
      ReviewDetailDto dto = new ReviewDetailDto();
      dto.setComment(review.getComment());
      dto.setRating(review.getRating());
      dto.setReviewDate(review.getReviewDate());
      dto.setUsername(review.getUsername());
      return dto;
    }).collect(Collectors.toList());
  }
}