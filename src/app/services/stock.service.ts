import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface StockPrice {
  symbol: string;
  currentPrice: number;
  highPrice: number;
  lowPrice: number;
  openPrice: number;
  previousClose: number;
  timestamp: number;
}

export interface StockSearchResult {
  symbol: string;
  name: string;
  type: string;
}

export interface StockDetails {
  symbol: string;
  name: string;
  sector: string;
  industry: string;
  marketCap: number;
  peRatio: number;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class StockService {
  private apiUrl = environment.finnhubApiUrl;
  private apiKey = environment.finnhubApiKey;

  constructor(private http: HttpClient) {}

  getStockPrice(symbol: string): Observable<number> {
    const url = `${this.apiUrl}/quote?symbol=${encodeURIComponent(symbol)}&token=${this.apiKey}`;
    console.log('Fetching stock price with URL:', url);

    return this.http.get<any>(url).pipe(
      map(response => {
        console.log('Price response:', response);
        if (!response.c || !response.d || !response.h || !response.l) {
          throw new Error('Invalid price data received from API');
        }
        return response.c; // Current price
      }),
      catchError(this.handleError)
    );
  }

  getFullStockPrice(symbol: string): Observable<StockPrice> {
    const url = `${this.apiUrl}/quote?symbol=${encodeURIComponent(symbol)}&token=${this.apiKey}`;
    console.log('Fetching full stock price with URL:', url);

    return this.http.get<any>(url).pipe(
      map(response => {
        console.log('Full price response:', response);
        if (!response.c || !response.d || !response.h || !response.l) {
          throw new Error('Invalid price data received from API');
        }
        return {
          symbol: response.symbol,
          currentPrice: response.c,
          change: response.d,
          changePercent: response.dp,
          highPrice: response.h,
          lowPrice: response.l,
          openPrice: response.o,
          previousClose: response.pc,
          timestamp: response.t
        };
      }),
      catchError(this.handleError)
    );
  }

  searchStocks(query: string): Observable<StockSearchResult[]> {
    if (!query || query.length < 1) {
      return new Observable(subscriber => {
        subscriber.next([]);
        subscriber.complete();
      });
    }

    const url = `${this.apiUrl}/search?q=${encodeURIComponent(query)}&token=${this.apiKey}`;
    console.log('Searching stocks with URL:', url);

    return this.http.get<any>(url).pipe(
      map(response => {
        console.log('Search response:', response);
        if (!response.result || !Array.isArray(response.result)) {
          console.warn('Invalid search response format:', response);
          return [];
        }
        return response.result.map((item: any) => ({
          symbol: item.symbol,
          name: item.description,
          exchange: item.exchange,
          type: item.type,
          price: item.price
        }));
      }),
      catchError(this.handleError)
    );
  }

  getStockDetails(symbol: string): Observable<StockDetails> {
    return this.http.get<any>(`${this.apiUrl}/quote?symbol=${symbol}&token=${this.apiKey}`).pipe(
      map(response => ({
        symbol,
        name: response.name,
        sector: response.type === 'Common Stock' ? response.sector : 'N/A',
        industry: response.type === 'Common Stock' ? response.industry : 'N/A',
        marketCap: response.marketCap,
        peRatio: response.peRatio,
        description: response.description
      })),
      catchError(this.handleError)
    );
  }

  private handleError(error: any): Observable<never> {
    console.error('API Error:', error);
    let errorMessage = 'An error occurred while fetching data.';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      if (error.status === 403 || (error.error && error.error.error === "You don't have access to this resource.")) {
        errorMessage = 'Warning: This stock requires a higher subscription tier or special permissions to access. Only a limited set of stocks are available with the current subscription.';
      } else if (error.status === 429) {
        errorMessage = 'API rate limit exceeded. Please try again later.';
      } else if (error.status === 404) {
        errorMessage = 'Stock not found. Please check the symbol and try again.';
      } else {
        errorMessage = `Error: ${error.status} ${error.statusText}`;
      }
    }

    return throwError(() => new Error(errorMessage));
  }
} 