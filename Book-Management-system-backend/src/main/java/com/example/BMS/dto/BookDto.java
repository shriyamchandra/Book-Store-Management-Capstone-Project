// In src/main/java/com/example/BMS/dto/BookDto.java
package com.example.BMS.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class BookDto {
    private Long id;
    private String isbn;
    private String title;
    private String author;
    private String description; // Added description
    private BigDecimal price;
}