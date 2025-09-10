import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Book {
  bookId: number;
  title: string;
  author: string;
  price: number;
  imageUrl: string;
  description: string;
  quantityInStock: number;
}

export interface Review {
  reviewId?: number;
  bookId?: number; // Optional as it might not be present when fetching all reviews for a book
  rating: number;
  comment: string;
  username?: string; // Assuming this is the customerName from backend
  reviewDate?: string; // Assuming this is the reviewOn from backend
  headline?: string; // Keep if backend still sends it, but not used in review.ts
}

export interface BookDetail {
  book: Book;
  reviews: Review[];
}

@Injectable({
  providedIn: 'root'
})
export class BookService {
  private apiUrl = 'http://localhost:8080/api/books';

  constructor(private http: HttpClient) { }

  getBooks(): Observable<Book[]> {
    return this.http.get<Book[]>(this.apiUrl);
  }

  getBookById(id: number): Observable<BookDetail> {
    return this.http.get<BookDetail>(`${this.apiUrl}/${id}`);
  }

  searchBooks(query: string): Observable<Book[]> {
    return this.http.get<Book[]>(`${this.apiUrl}/search`, { params: { query } });
  }
}