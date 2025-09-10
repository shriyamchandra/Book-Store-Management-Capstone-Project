import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface OrderBook {
  bookId: number;
  title: string;
  author: string;
  imageUrl?: string;
  price: number;
}

export interface OrderDetail {
  orderDetailsId: number;
  quantity: number;
  subtotal: number;
  book: OrderBook;
}

export interface Order {
  orderId: number;
  orderDate: string;
  orderTotal: number;
  status: string;
  paymentMethod?: string;
  recipientName?: string;
  recipientPhone?: string;
  orderDetails: OrderDetail[];
}

export interface OrderRequestDto {
  paymentMethod: string;
  recipientName: string;
  recipientPhone: string;
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private baseUrl = 'http://localhost:8080/api/orders';

  constructor(private http: HttpClient) {}

  private authHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ 'Authorization': `Bearer ${token}` });
  }

  createOrder(req: OrderRequestDto): Observable<Order> {
    return this.http.post<Order>(this.baseUrl, req, { headers: this.authHeaders() });
  }

  getMyOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(this.baseUrl, { headers: this.authHeaders() });
  }
}

