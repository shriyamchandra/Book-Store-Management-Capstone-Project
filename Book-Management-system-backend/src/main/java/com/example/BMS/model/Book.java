package com.example.BMS.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "books")
@Data
public class Book {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long bookId;

    private String title;
    private String author;
    private String description;
    private String isbn;
    private Double price;
    private int quantityInStock;
    private String imageUrl; // <-- ADD THIS FIELD
    private String binding; // <-- ADD THIS
    private String condition; // <-- ADD THIS
    private LocalDate publishDate;
    private LocalDate lastUpdatedOn;

    @ManyToOne
    @JoinColumn(name = "category_id", referencedColumnName = "categoryId")
    private Category category;

    @OneToMany(mappedBy = "book", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Review> reviews;
}