import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PortfolioService } from '../../services/portfolio.service';
import { StockService } from '../../services/stock.service';
import { debounceTime, distinctUntilChanged, switchMap, tap, map } from 'rxjs/operators';

@Component({
  selector: 'app-stock-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="stock-form-container">
      <h3 class="mb-4">Add Stock</h3>
      <form [formGroup]="stockForm" (ngSubmit)="onSubmit()" class="space-y-4">
        <div class="form-group">
          <label for="symbol" class="form-label">Stock Symbol</label>
          <div class="input-group">
            <input 
              type="text" 
              id="symbol" 
              formControlName="symbol" 
              class="form-control" 
              placeholder="Enter stock symbol"
              [class.is-invalid]="stockForm.get('symbol')?.invalid && stockForm.get('symbol')?.touched"
            >
            <button 
              type="button" 
              class="btn btn-outline-secondary" 
              (click)="clearSelection()"
              *ngIf="stockForm.get('symbol')?.value"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="invalid-feedback" *ngIf="stockForm.get('symbol')?.invalid && stockForm.get('symbol')?.touched">
            Please enter a valid stock symbol
          </div>
          
          <!-- Search Results Dropdown -->
          <div class="search-results mt-2" *ngIf="searchResults.length > 0 && !selectedStockDetails && !isSearching">
            <div 
              *ngFor="let result of searchResults" 
              class="search-result-item"
              (click)="selectStock(result.symbol)"
            >
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <strong>{{ result.symbol }}</strong> - {{ result.name }}
                </div>
                <span class="badge bg-secondary">{{ result.type }}</span>
              </div>
            </div>
          </div>
          
          <!-- Loading Indicator -->
          <div class="loading mt-2" *ngIf="isSearching">
            <div class="spinner-border spinner-border-sm" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
            Searching...
          </div>

          <!-- Stock Details -->
          <div class="stock-details mt-3" *ngIf="selectedStockDetails">
            <h4 class="mb-3">{{ selectedStockDetails.name }}</h4>
            <div class="details-grid">
              <div class="detail-item">
                <span class="label">Sector:</span>
                <span class="value">{{ selectedStockDetails.sector }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Industry:</span>
                <span class="value">{{ selectedStockDetails.industry }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Market Cap:</span>
                <span class="value">{{ selectedStockDetails.marketCap | number:'1.0-0' }}</span>
              </div>
              <div class="detail-item">
                <span class="label">P/E Ratio:</span>
                <span class="value">{{ selectedStockDetails.peRatio }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Dividend Yield:</span>
                <span class="value">{{ selectedStockDetails.dividendYield }}%</span>
              </div>
            </div>
          </div>
        </div>

        <div class="form-group">
          <label for="quantity" class="form-label">Quantity</label>
          <input 
            type="number" 
            id="quantity" 
            formControlName="quantity" 
            class="form-control" 
            placeholder="Enter quantity"
            [class.is-invalid]="stockForm.get('quantity')?.invalid && stockForm.get('quantity')?.touched"
          >
          <div class="invalid-feedback" *ngIf="stockForm.get('quantity')?.invalid && stockForm.get('quantity')?.touched">
            Please enter a valid quantity
          </div>
        </div>

        <div class="mt-4">
          <button 
            type="submit" 
            class="btn btn-primary w-100" 
            [disabled]="stockForm.invalid || isAdding"
          >
            <span *ngIf="isAdding" class="spinner-border spinner-border-sm me-1"></span>
            {{ isAdding ? 'Adding...' : 'Add Stock' }}
          </button>
        </div>

        <div class="alert alert-success mt-3" *ngIf="success">
          {{ success }}
        </div>

        <div class="alert alert-danger mt-3" *ngIf="error">
          {{ error }}
        </div>
      </form>
    </div>
  `,
  styles: [`
    .stock-form-container {
      max-width: 600px;
      margin: 0 auto;
      padding: 1.5rem;
      position: relative;
    }
    .form-group {
      margin-bottom: 1.5rem;
      position: relative;
    }
    .form-label {
      font-weight: 500;
      margin-bottom: 0.5rem;
    }
    .input-group {
      position: relative;
    }
    .search-results {
      position: absolute;
      top: calc(100% + 5px);
      left: 0;
      right: 0;
      z-index: 1000;
      background: white;
      border: 1px solid #dee2e6;
      border-radius: 0.25rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      max-height: 300px;
      overflow-y: auto;
      margin-top: 0.5rem;
    }
    .search-result-item {
      padding: 0.75rem 1rem;
      cursor: pointer;
      transition: background-color 0.2s;
      border-bottom: 1px solid #f0f0f0;
    }
    .search-result-item:last-child {
      border-bottom: none;
    }
    .search-result-item:hover {
      background-color: #f8f9fa;
    }
    .badge {
      font-size: 0.75rem;
      padding: 0.25rem 0.5rem;
    }
    .loading {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #6c757d;
      padding: 0.5rem 0;
    }
    .stock-details {
      background: #f8f9fa;
      border-radius: 0.5rem;
      padding: 1rem;
      margin-top: 1rem;
    }
    .details-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
    }
    .detail-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .label {
      font-weight: 500;
      color: #6c757d;
    }
    .value {
      font-weight: 600;
    }
    .btn-primary {
      padding: 0.75rem;
      font-weight: 500;
    }
    .alert {
      margin-top: 1rem;
      border-radius: 0.5rem;
    }
  `]
})
export class StockFormComponent implements OnInit {
  @Input() portfolioId: number = 1;
  @Output() stockAdded = new EventEmitter<void>();
  
  stockForm: FormGroup;
  error: string | null = null;
  success: string | null = null;
  isSearching = false;
  isAdding = false;
  searchResults: any[] = [];
  selectedStockDetails: any = null;

  constructor(
    private fb: FormBuilder,
    private portfolioService: PortfolioService,
    private stockService: StockService
  ) {
    this.stockForm = this.fb.group({
      symbol: ['', Validators.required],
      quantity: ['', [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit() {
    // Set up search as you type
    this.stockForm.get('symbol')?.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(symbol => {
        if (symbol && symbol.length >= 1) {
          this.isSearching = true;
        } else {
          this.isSearching = false;
          this.searchResults = [];
        }
      }),
      switchMap(symbol => {
        if (symbol && symbol.length >= 1) {
          return this.stockService.searchStocks(symbol);
        }
        return [];
      })
    ).subscribe({
      next: (results) => {
        this.searchResults = results;
        this.isSearching = false;
      },
      error: (error) => {
        this.error = 'Error searching stocks. Please try again.';
        this.isSearching = false;
        this.searchResults = [];
      }
    });
  }

  selectStock(symbol: string) {
    // Clear search results immediately to prevent double selection
    this.searchResults = [];
    
    // Update the form value
    this.stockForm.patchValue({ symbol });
    
    // Set loading state
    this.isSearching = true;
    this.error = null;
    this.selectedStockDetails = null;
    
    // Fetch stock details when a stock is selected
    this.stockService.getStockDetails(symbol).subscribe({
      next: (details) => {
        if (!details) {
          this.error = 'No stock details found. Please try again.';
          this.isSearching = false;
          return;
        }
        this.selectedStockDetails = details;
        this.isSearching = false;
        // Reset the form's touched state to prevent validation errors
        this.stockForm.get('symbol')?.markAsUntouched();
      },
      error: (error) => {
        console.error('Error fetching stock details:', error);
        this.error = 'Error fetching stock details. Please try again.';
        this.isSearching = false;
        this.selectedStockDetails = null;
      }
    });
  }

  clearSelection() {
    this.stockForm.patchValue({ symbol: '' });
    this.selectedStockDetails = null;
    this.searchResults = [];
    this.error = null;
    this.isSearching = false;
  }

  onSubmit() {
    if (this.stockForm.valid) {
      const { symbol, quantity } = this.stockForm.value;
      this.isAdding = true;
      this.error = null;
      this.success = null;

      this.stockService.getStockPrice(symbol).subscribe({
        next: (price: number) => {
          this.portfolioService.addStock(this.portfolioId, symbol, quantity, price).subscribe({
            next: () => {
              this.success = 'Stock added successfully!';
              this.stockForm.reset();
              this.selectedStockDetails = null;
              this.stockAdded.emit();
              this.searchResults = [];
              this.isAdding = false;
            },
            error: (error) => {
              this.error = error.message || 'Failed to add stock to portfolio';
              this.isAdding = false;
            }
          });
        },
        error: (error) => {
          this.error = error.message || 'Failed to fetch stock price';
          this.isAdding = false;
        }
      });
    }
  }
}
