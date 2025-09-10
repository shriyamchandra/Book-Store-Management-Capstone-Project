import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Book, BookService } from '../../services/book';
import { CartService, OrderItemDto } from '../../services/cart';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-search-results',
  templateUrl: './search-results.html',
  styleUrls: ['./search-results.css'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule
  ]
})
export class SearchResultsComponent implements OnInit {
  books: Book[] = [];
  query: string = '';

  constructor(
    private route: ActivatedRoute,
    private bookService: BookService,
    private cartService: CartService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.query = params['query'];
      if (this.query) {
        this.searchBooks();
      }
    });
  }

  searchBooks(): void {
    this.bookService.searchBooks(this.query).subscribe(
      (data: Book[]) => {
        this.books = data;
      },
      (error) => {
        console.error('Error fetching search results:', error);
      }
    );
  }

  addToCart(book: Book): void {
    console.log('Adding to cart:', book);
    const item: OrderItemDto = {
      bookId: book.bookId,
      quantity: 1,
      title: book.title,
      author: book.author,
      imageUrl: book.imageUrl,
      price: book.price,
      quantityInStock: book.quantityInStock
    };
    this.cartService.addToCart(item).subscribe({
      next: () => {
        console.log('Added to cart successfully');
        // Optionally, show a success message
      },
      error: (err) => {
        console.error('Add to cart failed:', err);
      }
    });
  }

  viewDetails(bookId: number): void {
    console.log('Navigating to book details for bookId:', bookId);
    this.router.navigate(['/book', bookId]);
  }
}