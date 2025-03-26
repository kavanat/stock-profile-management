import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PortfolioService } from '../../services/portfolio.service';

interface StockOption {
  symbol: string;
  name: string;
  price: number;
}

@Component({
  selector: 'app-stock-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './stock-form.component.html',
  styleUrls: ['./stock-form.component.css']
})
export class StockFormComponent {
  @Input() portfolioId: number = 1;
  @Output() stockAdded = new EventEmitter<void>();
  
  stockForm: FormGroup;
  error: string | null = null;
  success: string | null = null;
  isLoading = false;

  // Predefined stock options
  stockOptions: StockOption[] = [
    { symbol: 'AAPL', name: 'Apple Inc.', price: 175.50 },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 145.20 },
    { symbol: 'MSFT', name: 'Microsoft Corporation', price: 425.30 },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 180.75 },
    { symbol: 'META', name: 'Meta Platforms Inc.', price: 485.25 },
    { symbol: 'TSLA', name: 'Tesla Inc.', price: 175.80 },
    { symbol: 'NVDA', name: 'NVIDIA Corporation', price: 925.40 },
    { symbol: 'JPM', name: 'JPMorgan Chase & Co.', price: 180.25 },
    { symbol: 'V', name: 'Visa Inc.', price: 280.50 },
    { symbol: 'WMT', name: 'Walmart Inc.', price: 60.15 }
  ];

  constructor(
    private fb: FormBuilder,
    private portfolioService: PortfolioService
  ) {
    this.stockForm = this.fb.group({
      symbol: ['', [Validators.required]],
      quantity: ['', [Validators.required, Validators.min(1)]],
      price: ['', [Validators.required, Validators.min(0)]]
    });

    // Subscribe to symbol changes to auto-fill price
    this.stockForm.get('symbol')?.valueChanges.subscribe(symbol => {
      const selectedStock = this.stockOptions.find(stock => stock.symbol === symbol);
      if (selectedStock) {
        this.stockForm.patchValue({
          price: selectedStock.price
        });
      }
    });
  }

  onSubmit() {
    if (this.stockForm.valid) {
      this.isLoading = true;
      this.error = null;
      this.success = null;

      const formData = this.stockForm.value;
      this.portfolioService.addStock(
        this.portfolioId,
        formData.symbol,
        formData.quantity,
        formData.price
      ).subscribe({
        next: () => {
          this.success = 'Stock added successfully!';
          this.stockForm.reset();
          this.stockAdded.emit();
        },
        error: (err) => {
          this.error = err.error?.message || 'Failed to add stock. Please try again.';
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    }
  }
}
