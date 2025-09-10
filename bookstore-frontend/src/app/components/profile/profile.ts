import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { UserService, ProfileDto } from '../../services/user';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatSnackBarModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class ProfileComponent implements OnInit {
  form!: FormGroup;

  profile: ProfileDto | null = null;
  saving = false;

  constructor(private fb: FormBuilder, private userService: UserService, private snack: MatSnackBar) {
    // Initialize the form after FormBuilder is injected
    this.form = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      mobileNumber: ['', [Validators.required]],
      address: [''],
      city: [''],
      country: [''],
      pincode: ['']
    });
  }

  ngOnInit(): void {
    this.userService.getProfile().subscribe({
      next: (p) => {
        this.profile = p;
        this.form.patchValue({
          fullName: p.fullName || '',
          mobileNumber: p.mobileNumber || '',
          address: p.address || '',
          city: p.city || '',
          country: p.country || '',
          pincode: p.pincode || ''
        });
      },
      error: () => this.snack.open('Failed to load profile', 'Close', { duration: 2500 })
    });
  }

  save(): void {
    if (!this.profile) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.snack.open('Please fix highlighted fields', 'Close', { duration: 2000 });
      return;
    }
    const payload: ProfileDto = { email: this.profile.email, ...(this.form.value as any) };
    this.saving = true;
    this.userService.updateProfile(payload).subscribe({
      next: (p) => {
        this.saving = false;
        this.profile = p;
        this.snack.open('Profile updated', 'Close', { duration: 2000 });
      },
      error: () => {
        this.saving = false;
        this.snack.open('Failed to update profile', 'Close', { duration: 2500 });
      }
    });
  }

  // convenient getter for template
  get f() { return this.form.controls as any; }
}
