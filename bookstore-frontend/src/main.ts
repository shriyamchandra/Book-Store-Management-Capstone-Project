import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app'; // <-- Corrected from 'App' to 'AppComponent'

bootstrapApplication(AppComponent, appConfig) // <-- Corrected from 'App' to 'AppComponent'
  .catch((err) => console.error(err));