import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-custom-toast',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './custom-toast.html',
  styleUrls: ['./custom-toast.css']
})
export class CustomToastComponent { }