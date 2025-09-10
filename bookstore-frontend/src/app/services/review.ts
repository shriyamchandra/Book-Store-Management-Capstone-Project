import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Review } from './book'; // Import Review from book.ts

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private apiUrl = '/api/reviews'; // Adjust if your backend API is different

  constructor(private http: HttpClient) { }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    // Even if token is null, include the header keys for consistency
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    });
  }

  // Only send the fields the backend needs; username is resolved server-side from JWT
  submitReview(review: Pick<Review, 'bookId' | 'rating' | 'comment'>): Observable<Review> {
    return this.http.post<Review>(this.apiUrl, review, { headers: this.getAuthHeaders() });
  }

  getReviewsForBook(bookId: number): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/book/${bookId}`);
  }
}
