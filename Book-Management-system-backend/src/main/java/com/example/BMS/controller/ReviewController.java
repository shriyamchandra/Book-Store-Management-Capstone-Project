package com.example.BMS.controller;

import com.example.BMS.model.Review;
import com.example.BMS.service.ReviewService;
import com.example.BMS.dto.ReviewRequestDto; // Import the new DTO
import com.example.BMS.repository.UserRepository;
import com.example.BMS.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.authentication.AnonymousAuthenticationToken;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping
    public ResponseEntity<Review> createReview(@RequestBody ReviewRequestDto reviewRequestDto) {
        System.out.println("Backend: Received review submission request: " + reviewRequestDto);
        Long bookId = reviewRequestDto.getBookId();
        if (bookId == null) {
            System.out.println("Backend: bookId is null in received review DTO.");
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST); // Or a more specific error
        }
        System.out.println("Backend: Extracted bookId: " + bookId);

        // Create a Review entity from the DTO
        Review review = new Review();
        review.setRating(reviewRequestDto.getRating());
        review.setComment(reviewRequestDto.getComment());
        // Determine username: prefer authenticated user if available, fallback to DTO, else Anonymous
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !(auth instanceof AnonymousAuthenticationToken)) {
            String email = auth.getName(); // principal name is email
            String displayName = userRepository.findByEmail(email)
                    .map(User::getCustomer)
                    .map(c -> c != null ? c.getFullName() : null)
                    .filter(n -> n != null && !n.isBlank())
                    .orElseGet(() -> {
                        int at = email.indexOf('@');
                        return at > 0 ? email.substring(0, at) : email; // nicer fallback than full email
                    });
            System.out.println("Resolved reviewer display name: '" + displayName + "' for email: " + email);
            review.setUsername(displayName);
        } else if (reviewRequestDto.getUsername() != null && !reviewRequestDto.getUsername().isBlank()) {
            review.setUsername(reviewRequestDto.getUsername());
        } else {
            review.setUsername("Anonymous");
        }

        Review savedReview = reviewService.saveReview(bookId, review);
        System.out.println("Backend: Review saved successfully: " + savedReview);
        return new ResponseEntity<>(savedReview, HttpStatus.CREATED);
    }

    @GetMapping("/book/{bookId}")
    public ResponseEntity<List<Review>> getReviewsByBookId(@PathVariable Long bookId) {
        System.out.println("Backend: Received request to get reviews for bookId: " + bookId);
        List<Review> reviews = reviewService.getReviewsByBookId(bookId);
        System.out.println("Backend: Found " + reviews.size() + " reviews for bookId: " + bookId);
        return new ResponseEntity<>(reviews, HttpStatus.OK);
    }
}
