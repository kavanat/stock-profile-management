import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AlphaVantageService {
  private apiKey = environment.alphaVantageApiKey; // You'll need to add this to environment.ts
  private baseUrl = 'https://www.alphavantage.co/query';

  constructor(private http: HttpClient) {}

  getStockPrice(symbol: string): Observable<number> {
    return this.http.get(`${this.baseUrl}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${this.apiKey}`)
      .pipe(
        map((response: any) => {
          const quote = response['Global Quote'];
          if (quote && quote['05. price']) {
            return parseFloat(quote['05. price']);
          }
          throw new Error('Invalid response format');
        })
      );
  }

  searchStocks(keyword: string): Observable<any[]> {
    return this.http.get(`${this.baseUrl}?function=SYMBOL_SEARCH&keywords=${keyword}&apikey=${this.apiKey}`)
      .pipe(
        map((response: any) => {
          return response.bestMatches || [];
        })
      );
  }
} 