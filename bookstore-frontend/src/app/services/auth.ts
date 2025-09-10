import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap, BehaviorSubject } from 'rxjs'; // Added BehaviorSubject
import { CartService } from './cart';

export interface LoginDto { email: string; password: string; }
export interface AuthResponseDto { token: string; username: string; }
export interface UserDetails { username: string; }
export interface RegisterDto {
  email: string;
  password: string;
  fullName: string;
  mobileNumber: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';
  private _isLoggedIn = new BehaviorSubject<boolean>(this.hasToken()); // Added BehaviorSubject
  private _currentUser = new BehaviorSubject<UserDetails | null>(null); // Use UserDetails

  isLoggedIn$: Observable<boolean> = this._isLoggedIn.asObservable(); // Public observable
  currentUser$ = this._currentUser.asObservable();

  constructor(
    private http: HttpClient,
    private cartService: CartService
  ) {
    // On refresh: if we already have a token, consider user logged-in immediately
    if (this.hasToken()) {
      this._isLoggedIn.next(true);
      // Hydrate cart on startup
      this.cartService.fetchCart().subscribe({
        error: () => { /* ignore cart errors on boot */ }
      });
      // Try to resolve user from backend; only logout on explicit 401/403
      this.fetchCurrentUser().subscribe({
        next: (user) => {
          this._currentUser.next(user);
        },
        error: (err) => {
          console.warn('fetchCurrentUser failed on init', err);
          const status = err?.status;
          if (status === 401 || status === 403) {
            this.logout();
          } else {
            // Keep session if it was a transient/network error
            this._isLoggedIn.next(true);
          }
        }
      });
    }
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    });
  }

  login(credentials: LoginDto): Observable<AuthResponseDto> {
    return this.http.post<AuthResponseDto>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        if (response.token) {
          console.log('AuthService login response:', response); // Add this line
          localStorage.setItem('token', response.token);
          this._isLoggedIn.next(true); // Emit true on login
          this._currentUser.next({ username: response.username }); // Store username
          this.cartService.fetchCart().subscribe();
        }
      })
    );
  }

  register(userInfo: RegisterDto): Observable<string> {
    return this.http.post(`${this.apiUrl}/register`, userInfo, { responseType: 'text' });
  }

  hasToken(): boolean { // Renamed from isLoggedIn to avoid confusion with observable
    return !!localStorage.getItem('token');
  }

  logout(): void {
    localStorage.removeItem('token');
    this._isLoggedIn.next(false); // Emit false on logout
    this._currentUser.next(null); // Clear current user on logout
    this.cartService.clearCart();
  }

  // New method to fetch current user details
  fetchCurrentUser(): Observable<UserDetails> {
    // This is a placeholder. The actual endpoint and response structure depend on your backend.
    // Assuming an endpoint like /api/auth/me that returns { username: string, ... }
    return this.http.get<UserDetails>(`${this.apiUrl}/me`, { headers: this.getAuthHeaders() }).pipe(
      tap(user => console.log('Fetched current user:', user))
    );
  }
}
