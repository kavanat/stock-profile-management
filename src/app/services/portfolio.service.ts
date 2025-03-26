import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Portfolio } from '../models/portfolio';
import { StockHolding } from '../models/stock-holding';

@Injectable({
  providedIn: 'root'
})
export class PortfolioService {
  private apiUrl = 'http://localhost:8080/api/portfolios';

  constructor(private http: HttpClient) {}

  getPortfolio(id: number): Observable<Portfolio> {
    return this.http.get<Portfolio>(`${this.apiUrl}/${id}`);
  }

  createPortfolio(name: string): Observable<Portfolio> {
    return this.http.post<Portfolio>(this.apiUrl, null, {
      params: { name }
    });
  }

  addStock(portfolioId: number, symbol: string, quantity: number, price: number): Observable<StockHolding> {
    return this.http.post<StockHolding>(`${this.apiUrl}/${portfolioId}/stocks`, null, {
      params: { symbol, quantity: quantity.toString(), price: price.toString() }
    });
  }

  deleteStock(portfolioId: number, symbol: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${portfolioId}/stocks/${symbol}`);
  }

  getPortfolioHoldings(portfolioId: number): Observable<StockHolding[]> {
    return this.http.get<StockHolding[]>(`${this.apiUrl}/${portfolioId}/holdings`);
  }
}
