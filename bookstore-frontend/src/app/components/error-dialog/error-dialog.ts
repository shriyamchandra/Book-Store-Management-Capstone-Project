import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-error-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatIconModule,
    MatButtonModule,
    RouterLink
  ],
  templateUrl: './error-dialog.html',
  styleUrls: ['./error-dialog.css']
})
export class ErrorDialogComponent {
  // Inject the dialog reference so we can close it from our buttons
  constructor(public dialogRef: MatDialogRef<ErrorDialogComponent>) { }

  closeDialog(): void {
    this.dialogRef.close();
  }
}