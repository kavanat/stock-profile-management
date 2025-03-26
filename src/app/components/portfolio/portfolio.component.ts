import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PortfolioService } from '../../services/portfolio.service';
import { Portfolio } from '../../models/portfolio';
import { StockFormComponent } from '../stock-form/stock-form.component';

@Component({
  selector: 'app-portfolio',
  standalone: true,
  imports: [CommonModule, FormsModule, StockFormComponent],
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.css']
})
export class PortfolioComponent implements OnInit {
  portfolio: Portfolio | null = null;
  error: string | null = null;
  portfolioId: number = 1; // Changed from private to public

  constructor(private portfolioService: PortfolioService) {}

  ngOnInit() {
    this.loadPortfolio();
  }

  loadPortfolio() {
    this.portfolioService.getPortfolio(this.portfolioId).subscribe({
      next: (data) => {
        this.portfolio = data;
      },
      error: (err) => {
        if (err.status === 404) {
          // Create a new portfolio if it doesn't exist
          this.portfolioService.createPortfolio('My Portfolio').subscribe({
            next: (data) => {
              this.portfolio = data;
              this.portfolioId = data.id;
            },
            error: (err) => {
              this.error = 'Failed to create portfolio. Please try again.';
            }
          });
        } else {
          this.error = 'Failed to load portfolio. Please try again.';
        }
      }
    });
  }

  onStockAdded() {
    this.loadPortfolio();
  }

  deleteStock(symbol: string) {
    this.portfolioService.deleteStock(this.portfolioId, symbol).subscribe({
      next: () => {
        this.loadPortfolio();
      },
      error: (err) => {
        this.error = 'Failed to delete stock. Please try again.';
      }
    });
  }
}

