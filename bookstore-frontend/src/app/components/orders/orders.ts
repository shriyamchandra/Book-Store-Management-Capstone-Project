import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OrderService, Order } from '../../services/order';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './orders.html',
  styleUrls: ['./orders.css']
})
export class OrdersComponent implements OnInit {
  orders: Order[] = [];
  loading = true;

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.orderService.getMyOrders().subscribe({
      next: (list) => { this.orders = list || []; this.loading = false; },
      error: () => { this.orders = []; this.loading = false; }
    });
  }
}
