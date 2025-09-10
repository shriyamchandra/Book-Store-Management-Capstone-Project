import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

export interface ReviewDialogData {
  bookId: number;
  bookTitle: string;
}

@Component({
  selector: 'app-review-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule
  ],
  templateUrl: './review-form.html',
  styleUrls: ['./review-form.css']
})
export class ReviewFormComponent implements OnInit {
  reviewForm: FormGroup;
  currentRating: number = 0;

  constructor(
    public dialogRef: MatDialogRef<ReviewFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ReviewDialogData,
    private fb: FormBuilder
  ) {
    this.reviewForm = this.fb.group({
      rating: [0, [Validators.required, Validators.min(1)]],
      comment: ['', Validators.maxLength(500)]
    });
  }

  ngOnInit(): void {
    // Initialize form with data if needed
  }

  setRating(rating: number): void {
    this.currentRating = rating;
    this.reviewForm.controls['rating'].setValue(rating);
  }

  getStarIcon(star: number): string {
    return star <= this.currentRating ? 'star' : 'star_border';
  }

  onSubmit(): void {
    if (this.reviewForm.valid) {
      // In a real application, you would send this data to your backend
      console.log('Review submitted:', {
        bookId: this.data.bookId,
        ...this.reviewForm.value
      });
      this.dialogRef.close(this.reviewForm.value); // Close dialog and pass data
    }
  }

  onCancel(): void {
    this.dialogRef.close(); // Close dialog without passing data
  }
}
