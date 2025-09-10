import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService, CartDto } from '../../services/cart';
import { Observable } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    CommonModule, RouterLink, MatCardModule, MatButtonModule,
    MatIconModule, MatProgressSpinnerModule, MatSnackBarModule
  ],
  templateUrl: './cart.html',
  styleUrls: ['./cart.css']
})
export class CartComponent {
  cart$: Observable<CartDto | null>;

  constructor(
    private cartService: CartService,
    private snackBar: MatSnackBar
  ) {
    this.cart$ = this.cartService.cart$;
  }

  onUpdateQuantity(bookId: number, newQuantity: number): void {
    if (newQuantity < 1) {
      this.onRemoveItem(bookId);
      return;
    }
    this.cartService.updateItemQuantity(bookId, newQuantity).subscribe({
      error: (err) => {
        // The error from the backend is now in err.error.text for some reason, let's handle that.
        const errorMessage = err.error.text || err.error || 'An error occurred.';
        this.snackBar.open(errorMessage, 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  onRemoveItem(bookId: number): void {
    this.cartService.removeItem(bookId).subscribe();
  }
}