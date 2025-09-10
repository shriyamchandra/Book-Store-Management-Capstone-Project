import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

@Component({
  selector: 'app-payment-success',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './success.html',
  styleUrls: ['./success.css']
})
export class PaymentSuccessComponent {
  orderId: string;
  eta = '3–7 business days';

  constructor(private router: Router) {
    const st = this.router.getCurrentNavigation()?.extras?.state as { orderId?: number } | undefined;
    this.orderId = st?.orderId ? `ORD-${st.orderId}` : 'ORD-' + (Date.now().toString().slice(-6));
  }
}
