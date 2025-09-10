import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Book, BookService } from '../../services/book';
import { CartService } from '../../services/cart';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CustomToastComponent } from '../custom-toast/custom-toast';

@Component({
  selector: 'app-book-list',
  standalone: true,
  imports: [
    CommonModule,
    // RouterLink,
    MatCardModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './book-list.html',
  styleUrls: ['./book-list.css']
})
export class BookListComponent implements OnInit {
  books: Book[] = [];
  displayBooks: Book[] = [];
  trendingBooks: Book[] = [];
  isLoading = true;
  sortBy: 'best' | 'priceAsc' | 'priceDesc' | 'title' = 'best';
  density: 'comfortable' | 'compact' = 'comfortable';

  constructor(
    private bookService: BookService,
    private cartService: CartService,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.bookService.getBooks().subscribe(data => {
      this.books = data;
      this.computeTrending();
      this.applySort();
      this.isLoading = false;
    });
  }

  navigateToDetail(bookId: number): void {
    this.router.navigate(['/books', bookId]);
  }

  addToCart(book: Book, event: MouseEvent): void {
    event.stopPropagation(); // Stop the click from navigating

    this.cartService.addToCart({
      bookId: book.bookId,
      quantity: 1,
      title: book.title,
      author: book.author,
      imageUrl: book.imageUrl,
      price: book.price,
      quantityInStock: book.quantityInStock
    }).subscribe(() => {
      this.snackBar.openFromComponent(CustomToastComponent, {
        duration: 3000,
        verticalPosition: 'top',
        horizontalPosition: 'right',
        panelClass: ['custom-toast-container'] // Use a class for positioning if needed
      });
    });
  }

  onSortChange(value: string) {
    if (value === 'priceAsc' || value === 'priceDesc' || value === 'title' || value === 'best') {
      this.sortBy = value;
      this.applySort();
    }
  }

  toggleDensity() {
    this.density = this.density === 'comfortable' ? 'compact' : 'comfortable';
  }

  private applySort() {
    const books = [...this.books];
    switch (this.sortBy) {
      case 'priceAsc':
        books.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'priceDesc':
        books.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'title':
        books.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        break;
      default:
        // best: keep original order
        break;
    }
    this.displayBooks = books;
  }

  private computeTrending() {
    const list = [...this.books];
    // Simple heuristic: balance scarcity and price for an eye-pleasing ordering.
    // Higher price and lower quantity give higher score.
    const norm = (v: number, min: number, max: number) => {
      if (max === min) return 0;
      return (v - min) / (max - min);
    };
    const prices = list.map(b => b.price || 0);
    const qties = list.map(b => b.quantityInStock || 0);
    const pMin = Math.min(...prices, 0), pMax = Math.max(...prices, 1);
    const qMin = Math.min(...qties, 0), qMax = Math.max(...qties, 1);
    const scored = list.map(b => {
      const p = norm(b.price || 0, pMin, pMax);
      const q = 1 - norm(b.quantityInStock || 0, qMin, qMax); // fewer in stock = higher
      const score = 0.65 * p + 0.35 * q;
      return { book: b, score };
    });
    scored.sort((a, b) => b.score - a.score);
    this.trendingBooks = scored.slice(0, 10).map(s => s.book);
  }

  scrollRail(el: HTMLElement, dir: number) {
    if (!el) return;
    const delta = Math.max(280, Math.round(el.clientWidth * 0.9)) * dir;
    el.scrollBy({ left: delta, behavior: 'smooth' });
  }
}
