import { Component, Inject } from '@angular/core'; // 1. Import Inject
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog'; // 2. Import MAT_DIALOG_DATA
import { MatButtonModule } from '@angular/material/button';
import { CartItem } from '../../services/cart'; // 3. Import CartItem

@Component({
  selector: 'app-add-to-cart-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule
  ],
  templateUrl: './add-to-cart-dialog.html',
  styleUrls: ['./add-to-cart-dialog.css']
})
export class AddToCartDialogComponent {
  // 4. Inject the data passed from the parent component
  constructor(@Inject(MAT_DIALOG_DATA) public data: { item: CartItem }) { }
}