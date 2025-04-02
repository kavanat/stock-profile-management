import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StockFormComponent } from '../stock-form/stock-form.component';
import { PortfolioService } from '../../services/portfolio.service';
import { Portfolio } from '../../models/portfolio';
import { StockHolding } from '../../models/stock-holding';

@Component({
  selector: 'app-portfolio',
  standalone: true,
  imports: [CommonModule, FormsModule, StockFormComponent],
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.css']
})
export class PortfolioComponent implements OnInit {
  portfolio: Portfolio | null = null;
  holdings: StockHolding[] = [];
  portfolioId: number = 1;
  error: string | null = null;

  constructor(private portfolioService: PortfolioService) {}

  ngOnInit(): void {
    this.loadPortfolio();
  }

  loadPortfolio(): void {
    this.error = null;
    this.portfolioService.getPortfolio(this.portfolioId).subscribe({
      next: (data) => {
        this.portfolio = data;
        this.holdings = data.holdings || [];
      },
      error: (error) => {
        if (error.status === 404) {
          // Create a new portfolio if it doesn't exist
          this.portfolioService.createPortfolio('My Portfolio').subscribe({
            next: (newPortfolio) => {
              this.portfolio = newPortfolio;
              this.portfolioId = newPortfolio.id;
              this.holdings = [];
            },
            error: (err) => {
              this.error = 'Error creating portfolio. Please try again.';
              console.error('Error creating portfolio:', err);
            }
          });
        } else {
          this.error = 'Error loading portfolio. Please try again.';
          console.error('Error loading portfolio:', error);
        }
      }
    });
  }

  onStockAdd(): void {
    this.loadPortfolio();
  }

  deleteStock(holding: StockHolding): void {
    if (this.portfolio) {
      this.portfolioService.deleteStock(this.portfolioId, holding.symbol).subscribe({
        next: () => {
          this.loadPortfolio();
        },
        error: (error) => {
          this.error = 'Error deleting stock. Please try again.';
          console.error('Error deleting stock:', error);
        }
      });
    }
  }
}

