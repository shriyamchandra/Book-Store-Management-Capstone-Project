import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar';
import { FooterComponent } from './components/footer/footer';
import { routeAnimations } from './animations'; // <-- 1. Import our new animation
import { AiChatComponent } from './components/ai-chat/ai-chat';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, FooterComponent, AiChatComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
  animations: [routeAnimations] // <-- 2. Add the animations property here
})
export class AppComponent {
  title = 'bookstore-frontend';

  // 3. This method helps the animation trigger know which page is active
  prepareRoute(outlet: RouterOutlet) {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData['animation'];
  }
}
