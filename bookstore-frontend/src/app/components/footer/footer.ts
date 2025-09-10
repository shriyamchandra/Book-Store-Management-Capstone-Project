import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './footer.html',
  styleUrls: ['./footer.css']
})
export class FooterComponent {
  @Input() aboutTitle = 'About the shop';
  @Input() aboutText = `Welcome to Bookstore, your ultimate destination for all things books! We are passionate book lovers dedicated to connecting readers with a diverse selection of titles, from bestsellers to hidden gems. Our curated collection spans various genres, ensuring there's something for everyone.`;
  @Input() brandLogo = '/assets/footer/brand-logo.svg';
  @Input() whatsappNumber = '918000000000'; // E.g., 91 + number for India

  // Angular templates cannot call `new Date()`; expose a field instead
  currentYear = new Date().getFullYear();
}
