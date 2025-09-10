
import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Observable, of, Subscription } from 'rxjs';
import { debounceTime, switchMap, catchError } from 'rxjs/operators';
import { Book, BookService } from '../../services/book';
import { CartService } from '../../services/cart';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  @ViewChild('searchInput') searchInput!: ElementRef;

  isSearchActive = false;
  isAccountMenuOpen = false;
  searchControl = new FormControl();
  searchResults$: Observable<Book[]> = of([]);
  results: Book[] = [];
  private rawResults: Book[] = [];
  showFilters = false;
  // Simple client-side filters
  filterInStock = false;
  filterPrice: 'all' | '0-10' | '10-25' | '25-50' | '50+' = 'all';
  cartItemCount: number = 0;
  isLoggedIn: boolean = false;
  private cartSubscription: Subscription | undefined;
  private authSubscription: Subscription | undefined;

  constructor(
    private router: Router,
    private bookService: BookService,
    private cartService: CartService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.searchResults$ = this.searchControl.valueChanges.pipe(
      debounceTime(300),
      switchMap(query => {
        // Ensure query is a string before passing to searchBooks
        const searchQuery = typeof query === 'string' ? query : '';
        if (searchQuery && searchQuery.length >= 2) {
          return this.bookService.searchBooks(searchQuery).pipe(
            catchError(() => of([]))
          );
        }
        else {
          return of([]);
        }
      })
    );

    // Keep a filtered local array for richer UI
    this.searchResults$.subscribe(list => {
      this.rawResults = list || [];
      this.results = this.applyFilters(this.rawResults);
    });

    this.cartSubscription = this.cartService.cart$.subscribe(cart => {
      this.cartItemCount = cart ? cart.items.reduce((sum, item) => sum + item.quantity, 0) : 0;
    });

    this.authSubscription = this.authService.isLoggedIn$.subscribe(loggedIn => {
      this.isLoggedIn = loggedIn;
    });
  }

  ngOnDestroy(): void {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  toggleAccountMenu(): void {
    this.isAccountMenuOpen = !this.isAccountMenuOpen;
  }

  closeAccountMenu(): void {
    this.isAccountMenuOpen = false;
  }

  goProfile(): void {
    this.router.navigate(['/profile']);
    this.closeAccountMenu();
  }

  goOrders(): void {
    this.router.navigate(['/orders']);
    this.closeAccountMenu();
  }

  toggleSearch(): void {
    this.isSearchActive = !this.isSearchActive;
    if (this.isSearchActive) {
      this.showFilters = false; // start simple
      // Defer focus until input is in the DOM and laid out
      setTimeout(() => this.searchInput?.nativeElement?.focus(), 60);
      setTimeout(() => this.searchInput?.nativeElement?.focus(), 180);
    } else {
      this.searchControl.setValue('');
      this.results = [];
    }
  }

  goToBook(bookId: number): void {
    this.router.navigate(['/books', bookId]);
    this.isSearchActive = false;
    this.searchControl.setValue('');
  }

  toggleInStock(): void {
    this.filterInStock = !this.filterInStock;
    this.results = this.applyFilters(this.rawResults);
  }

  setPriceFilter(val: 'all' | '0-10' | '10-25' | '25-50' | '50+'): void {
    this.filterPrice = val;
    this.results = this.applyFilters(this.rawResults);
  }

  private applyFilters(list: Book[]): Book[] {
    let out = [...list];
    if (this.filterInStock) out = out.filter(b => (b.quantityInStock || 0) > 0);
    const price = (p: number | undefined) => Number(p || 0);
    switch (this.filterPrice) {
      case '0-10': out = out.filter(b => price(b.price) >= 0 && price(b.price) < 10); break;
      case '10-25': out = out.filter(b => price(b.price) >= 10 && price(b.price) < 25); break;
      case '25-50': out = out.filter(b => price(b.price) >= 25 && price(b.price) < 50); break;
      case '50+': out = out.filter(b => price(b.price) >= 50); break;
      default: break;
    }
    return out;
  }
}
