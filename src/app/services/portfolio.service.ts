import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Portfolio } from '../models/portfolio';
import { StockHolding } from '../models/stock-holding';
import { environment } from '../../environments/environment';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { switchMap } from 'rxjs/operators';

export interface Stock {
  symbol: string;
  quantity: number;
  purchasePrice: number;
}

@Injectable({
  providedIn: 'root'
})
export class PortfolioService {
  private apiUrl = environment.portfolioApiUrl;

  constructor(private http: HttpClient) {}

  getPortfolio(id: number): Observable<Portfolio> {
    return this.http.get<Portfolio>(`${this.apiUrl}/${id}`);
  }

  createPortfolio(name: string): Observable<Portfolio> {
    return this.http.post<Portfolio>(this.apiUrl, { name });
  }

  addStock(portfolioId: number, symbol: string, quantity: number, price: number): Observable<Portfolio> {
    return this.http.post<Portfolio>(`${this.apiUrl}/${portfolioId}/stocks`, {
      symbol,
      quantity,
      price
    }).pipe(
      catchError(this.handleError)
    );
  }

  removeStock(portfolioId: number, symbol: string, quantity?: number): Observable<Portfolio> {
    let url = `${this.apiUrl}/${portfolioId}/stocks/${symbol}`;
    if (quantity) {
      url += `?reduce=${quantity}`;
    }
    return this.http.delete<void>(url).pipe(
      catchError(error => {
        console.error('Error removing stock:', error);
        if (error.status === 500) {
          return this.getPortfolio(portfolioId);
        }
        return throwError(() => error.error?.message || 'Failed to remove stock from portfolio');
      })
    ).pipe(
      switchMap(() => this.getPortfolio(portfolioId))
    );
  }

  reduceStockQuantity(portfolioId: number, symbol: string, quantity: number): Observable<StockHolding> {
    const url = `${this.apiUrl}/${portfolioId}/stocks/${symbol}/reduce`;
    return this.http.put<StockHolding>(url, null, {
      params: {
        quantity: quantity.toString()
      }
    }).pipe(
      catchError(this.handleError)
    );
  }

  getPortfolioHoldings(portfolioId: number): Observable<StockHolding[]> {
    return this.http.get<StockHolding[]>(`${this.apiUrl}/${portfolioId}/holdings`);
  }

  private handleError(error: any) {
    console.error('An error occurred:', error);
    return throwError('Something bad happened; please try again later.');
  }
}
