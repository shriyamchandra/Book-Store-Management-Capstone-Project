import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap, catchError, throwError } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Book } from './book';

export interface OrderItemDto {
  bookId: number;
  quantity: number;
  title: string;
  author: string;
  imageUrl: string;
  price: number;
  quantityInStock: number;
}

export interface CartDto {
  orderId: number;
  totalAmount: number;
  items: OrderItemDto[];
}

export interface CartItem {
  book: Book;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = 'http://localhost:8080/api/orders/cart';
  private cart = new BehaviorSubject<CartDto | null>(null);
  cart$ = this.cart.asObservable();

  constructor(private http: HttpClient) { }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  fetchCart(): Observable<CartDto> {
    if (!localStorage.getItem('token')) {
      this.cart.next(null);
      return new Observable(observer => observer.complete());
    }
    return this.http.get<CartDto>(this.apiUrl, { headers: this.getAuthHeaders() }).pipe(
      tap(cartData => this.cart.next(cartData)),
      catchError(error => {
        if (error.status === 204 || error.status === 404) {
          this.cart.next({ orderId: 0, totalAmount: 0, items: [] });
        }
        return throwError(() => error);
      })
    );
  }

  addToCart(item: OrderItemDto): Observable<CartDto> {
    const { bookId, quantity } = item;
    return this.http.post<CartDto>(`${this.apiUrl}/items`, { bookId, quantity }, { headers: this.getAuthHeaders() }).pipe(
      tap(updatedCart => this.cart.next(updatedCart))
    );
  }

  updateItemQuantity(bookId: number, quantity: number): Observable<CartDto> {
    return this.http.put<CartDto>(`${this.apiUrl}/items/${bookId}?quantity=${quantity}`, {}, { headers: this.getAuthHeaders() }).pipe(
      tap(updatedCart => this.cart.next(updatedCart))
    );
  }

  removeItem(bookId: number): Observable<CartDto> {
    return this.http.delete<CartDto>(`${this.apiUrl}/items/${bookId}`, { headers: this.getAuthHeaders() }).pipe(
      tap(updatedCart => this.cart.next(updatedCart))
    );
  }

  clearCart() {
    this.cart.next(null);
  }
}