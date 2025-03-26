import { Routes } from '@angular/router';
import { PortfolioComponent } from './components/portfolio/portfolio.component';

export const routes: Routes = [
  { path: '', redirectTo: '/portfolio', pathMatch: 'full' },
  { path: 'portfolio', component: PortfolioComponent }
];
