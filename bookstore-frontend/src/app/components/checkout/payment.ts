import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatRadioModule } from '@angular/material/radio';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CartService, CartDto } from '../../services/cart';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatRadioModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './payment.html',
  styleUrls: ['./payment.css']
})
export class PaymentPageComponent {
  cart$: Observable<CartDto | null>;
  paying = false;

  form: FormGroup;
  banks = ['HDFC Bank', 'ICICI Bank', 'SBI', 'Axis Bank', 'Kotak Mahindra'];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private cartService: CartService
  ) {
    this.cart$ = this.cartService.cart$;
    this.form = this.fb.group({
      method: ['card'],
      name: [''],
      cardNumber: [''],
      expiry: [''],
      cvv: [''],
      upi: [''],
      bank: ['']
    });
  }

  get method(): string { return this.form.get('method')!.value; }

  isValid(): boolean {
    const m = this.method;
    if (m === 'card') {
      const n = (this.form.get('name')!.value || '').trim();
      const c = ((this.form.get('cardNumber')!.value || '') + '').replace(/\s+/g, '');
      const e = (this.form.get('expiry')!.value || '').trim();
      const v = (this.form.get('cvv')!.value || '').trim();
      return n.length >= 3 && /^\d{16}$/.test(c) && /^\d{2}\/\d{2}$/.test(e) && /^\d{3}$/.test(v);
    }
    if (m === 'upi') {
      const u = (this.form.get('upi')!.value || '').trim();
      return /.+@.+/.test(u);
    }
    if (m === 'netbanking') {
      return !!this.form.get('bank')!.value;
    }
    if (m === 'cod') return true;
    return false;
  }

  placeOrder(): void {
    if (!this.isValid()) return;
    this.paying = true;
    setTimeout(() => {
      this.paying = false;
      this.router.navigate(['/checkout/success']);
    }, 1200);
  }

  onCardNumberInput(e: Event) {
    const input = e.target as HTMLInputElement;
    const digits = (input.value || '').replace(/\D+/g, '').slice(0, 16);
    const groups = digits.match(/.{1,4}/g) || [];
    const formatted = groups.join(' ');
    this.form.get('cardNumber')!.setValue(formatted, { emitEvent: false });
  }

  onExpiryInput(e: Event) {
    const input = (e.target as HTMLInputElement);
    let v = (input.value || '').replace(/\D+/g, '').slice(0, 4);
    if (v.length >= 3) v = v.slice(0,2) + '/' + v.slice(2);
    this.form.get('expiry')!.setValue(v, { emitEvent: false });
  }

  onCvvInput(e: Event) {
    const input = (e.target as HTMLInputElement);
    const v = (input.value || '').replace(/\D+/g, '').slice(0, 3);
    this.form.get('cvv')!.setValue(v, { emitEvent: false });
  }
}
