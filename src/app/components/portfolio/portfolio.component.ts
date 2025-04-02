import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { StockFormComponent } from '../stock-form/stock-form.component';
import { PortfolioService } from '../../services/portfolio.service';
import { Portfolio } from '../../models/portfolio';
import { StockHolding } from '../../models/stock-holding';

@Component({
  selector: 'app-portfolio',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, StockFormComponent],
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.css']
})
export class PortfolioComponent implements OnInit {
  portfolio: Portfolio | null = null;
  holdings: StockHolding[] = [];
  portfolioId: number = 1;
  error: string | null = null;
  success: string | null = null;
  isDeleting: boolean = false;
  stockToDelete: StockHolding | null = null;
  quantityToDelete: number = 1;
  maxQuantity: number = 0;
  
  // Sorting and filtering
  sortField: keyof StockHolding = 'symbol';
  sortDirection: 'asc' | 'desc' = 'asc';
  searchTerm: string = '';
  isLoading: boolean = false;

  constructor(private portfolioService: PortfolioService) {}

  ngOnInit(): void {
    this.loadPortfolio();
  }

  loadPortfolio(): void {
    this.isLoading = true;
    this.error = null;
    this.success = null;
    this.portfolioService.getPortfolio(this.portfolioId).subscribe({
      next: (data) => {
        this.portfolio = data;
        this.holdings = data.holdings || [];
        this.isLoading = false;
      },
      error: (error) => {
        if (error.status === 404) {
          // Create a new portfolio if it doesn't exist
          this.portfolioService.createPortfolio('My Portfolio').subscribe({
            next: (newPortfolio) => {
              this.portfolio = newPortfolio;
              this.portfolioId = newPortfolio.id;
              this.holdings = [];
              this.isLoading = false;
            },
            error: (err) => {
              this.error = 'Error creating portfolio. Please try again.';
              console.error('Error creating portfolio:', err);
              this.isLoading = false;
            }
          });
        } else {
          this.error = 'Error loading portfolio. Please try again.';
          console.error('Error loading portfolio:', error);
          this.isLoading = false;
        }
      }
    });
  }

  onStockAdd(): void {
    this.loadPortfolio();
  }

  confirmDelete(holding: StockHolding): void {
    this.stockToDelete = holding;
    this.maxQuantity = holding.quantity;
    this.quantityToDelete = 1;
  }

  cancelDelete(): void {
    this.stockToDelete = null;
    this.quantityToDelete = 1;
  }

  deleteStock(): void {
    if (!this.portfolio || !this.stockToDelete) return;

    this.isDeleting = true;
    this.error = null;
    this.success = null;

    // If quantityToDelete is provided and less than the current quantity,
    // reduce the quantity instead of deleting the entire stock
    if (this.quantityToDelete && this.quantityToDelete < this.stockToDelete.quantity) {
      this.portfolioService.reduceStockQuantity(this.portfolio.id, this.stockToDelete.symbol, this.quantityToDelete).subscribe({
        next: (updatedHolding) => {
          this.success = `Successfully removed ${this.quantityToDelete} shares of ${this.stockToDelete.symbol}`;
          this.loadPortfolio(); // Reload the entire portfolio to get updated data
          this.isDeleting = false;
          this.stockToDelete = null;
        },
        error: (error) => {
          this.error = error.message || 'Failed to remove shares';
          this.isDeleting = false;
        }
      });
    } else {
      // If no quantity specified or quantity matches current holdings, delete the entire stock
      this.portfolioService.removeStock(this.portfolio.id, this.stockToDelete.symbol).subscribe({
        next: (updatedPortfolio) => {
          if (updatedPortfolio) {
            this.success = `Successfully removed ${this.stockToDelete.symbol} from portfolio`;
            this.portfolio = updatedPortfolio;
            this.holdings = updatedPortfolio.holdings || [];
          }
          this.isDeleting = false;
          this.stockToDelete = null;
        },
        error: (error) => {
          // If we get a 500 error, try to reload the portfolio to get the current state
          if (error.status === 500) {
            this.loadPortfolio();
            this.success = `Successfully removed ${this.stockToDelete.symbol} from portfolio`;
          } else {
            this.error = error.message || 'Failed to remove stock';
          }
          this.isDeleting = false;
          this.stockToDelete = null;
        }
      });
    }
  }

  get remainingStocksCount(): number {
    return this.holdings.length;
  }

  // Sorting methods
  sort(field: keyof StockHolding): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
  }

  get sortedHoldings(): StockHolding[] {
    let filtered = this.holdings.filter(holding => 
      holding.symbol.toLowerCase().includes(this.searchTerm.toLowerCase())
    );

    return filtered.sort((a, b) => {
      const aValue = a[this.sortField];
      const bValue = b[this.sortField];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return this.sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      return this.sortDirection === 'asc'
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    });
  }

  // Format currency
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  }

  // Calculate portfolio performance
  get portfolioPerformance(): { value: number; percentage: number } {
    if (!this.portfolio) return { value: 0, percentage: 0 };
    
    const totalValue = this.portfolio.totalValue;
    const totalCost = this.holdings.reduce((sum, holding) => 
      sum + (holding.quantity * holding.averagePrice), 0);
    
    const value = totalValue - totalCost;
    const percentage = (value / totalCost) * 100;
    
    return { value, percentage };
  }

  showSuccessMessage(): void {
    this.success = 'Stock deleted successfully';
    setTimeout(() => {
      this.success = null;
    }, 3000);
  }
}

