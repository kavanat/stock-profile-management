import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PortfolioComponent } from './components/portfolio/portfolio.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, PortfolioComponent],
  template: `
    <div class="container">
      <h1 class="text-center my-4">Stock Profile Management</h1>
      <app-portfolio></app-portfolio>
    </div>
  `,
  styles: [`
    h1 {
      color: #2c3e50;
      font-weight: 600;
    }
  `]
})
export class AppComponent {
  title = 'Stock Profile Management';
}
