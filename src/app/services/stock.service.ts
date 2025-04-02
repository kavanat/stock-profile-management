import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError, timer } from 'rxjs';
import { catchError, map, tap, shareReplay, debounceTime, retryWhen, delayWhen } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { DataModeService } from './data-mode.service';

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
  private searchCache: Map<string, { results: StockSearchResult[], timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
  private readonly RATE_LIMIT_DELAY = 2000; // 2 seconds delay between requests
  private readonly MAX_RETRIES = 3; // Maximum number of retries for rate limit errors
  private requestCount = 0;
  private lastRequestTime = 0;

  constructor(
    private http: HttpClient,
    private dataModeService: DataModeService
  ) {
    console.log('Using Alpha Vantage API Key:', environment.alphaVantageApiKey);
  }

  private handleError(error: any): Observable<never> {
    console.error('API Error:', error);
    let errorMessage = 'An error occurred while fetching data.';
    
    if (error.status === 401) {
      errorMessage = 'API key is invalid or has expired. Please check your API key.';
    } else if (error.status === 403) {
      errorMessage = 'Access forbidden. Please check your API key permissions.';
    } else if (error.status === 429) {
      errorMessage = 'Rate limit exceeded. Please wait a moment before trying again.';
      return throwError(() => new Error(errorMessage));
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    }
    
    return throwError(() => new Error(errorMessage));
  }

  private enforceRateLimit(): void {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.RATE_LIMIT_DELAY) {
      const delay = this.RATE_LIMIT_DELAY - timeSinceLastRequest;
      console.log(`Rate limiting: waiting ${delay}ms before next request`);
      return;
    }
    
    this.lastRequestTime = now;
    this.requestCount++;
  }

  getStockPrice(symbol: string): Observable<number> {
    if (this.dataModeService.isUsingMockData()) {
      return of(this.getMockPrice(symbol));
    }

    this.enforceRateLimit();
    const url = environment.stockApiUrl;
    const params = {
      function: 'GLOBAL_QUOTE',
      symbol,
      apikey: environment.alphaVantageApiKey
    };

    console.log('Making request to:', url, 'with params:', { ...params, apikey: environment.alphaVantageApiKey.substring(0, 8) + '...' });

    return this.http.get<any>(url, { params }).pipe(
      tap(response => console.log('Alpha Vantage API Response:', response)),
      map(response => {
        const quote = response['Global Quote'];
        if (!quote || !quote['05. price']) {
          throw new Error('No price data available');
        }
        return parseFloat(quote['05. price']);
      }),
      retryWhen(errors => errors.pipe(
        delayWhen(() => timer(this.RATE_LIMIT_DELAY)),
        tap(() => console.log('Retrying request after rate limit delay...'))
      )),
      catchError(error => {
        console.log('Error fetching price, using mock data:', error);
        return of(this.getMockPrice(symbol));
      }),
      shareReplay(1)
    );
  }

  getFullStockPrice(symbol: string): Observable<StockPrice> {
    if (this.dataModeService.isUsingMockData()) {
      const mockPrice = this.getMockPrice(symbol);
      return of({
        symbol,
        currentPrice: mockPrice,
        highPrice: mockPrice * 1.02,
        lowPrice: mockPrice * 0.98,
        openPrice: mockPrice,
        previousClose: mockPrice * 0.99,
        timestamp: Math.floor(Date.now() / 1000)
      });
    }

    this.enforceRateLimit();
    const url = environment.stockApiUrl;
    const params = {
      function: 'GLOBAL_QUOTE',
      symbol,
      apikey: environment.alphaVantageApiKey
    };

    console.log('Making request to:', url, 'with params:', { ...params, apikey: environment.alphaVantageApiKey.substring(0, 8) + '...' });

    return this.http.get<any>(url, { params }).pipe(
      tap(response => console.log('Alpha Vantage API Response:', response)),
      map(response => {
        const quote = response['Global Quote'];
        if (!quote || !quote['05. price']) {
          throw new Error('No price data available');
        }
        return {
          symbol,
          currentPrice: parseFloat(quote['05. price']),
          highPrice: parseFloat(quote['03. high']),
          lowPrice: parseFloat(quote['04. low']),
          openPrice: parseFloat(quote['02. open']),
          previousClose: parseFloat(quote['08. previous close']),
          timestamp: Math.floor(Date.now() / 1000)
        };
      }),
      retryWhen(errors => errors.pipe(
        delayWhen(() => timer(this.RATE_LIMIT_DELAY)),
        tap(() => console.log('Retrying request after rate limit delay...'))
      )),
      catchError(error => {
        console.log('Error fetching price data, using mock data:', error);
        const mockPrice = this.getMockPrice(symbol);
        return of({
          symbol,
          currentPrice: mockPrice,
          highPrice: mockPrice * 1.02,
          lowPrice: mockPrice * 0.98,
          openPrice: mockPrice,
          previousClose: mockPrice * 0.99,
          timestamp: Math.floor(Date.now() / 1000)
        });
      }),
      shareReplay(1)
    );
  }

  private getMockPrice(symbol: string): number {
    // Generate a mock price based on the symbol
    const basePrice = symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 1000;
    const randomFactor = 0.8 + Math.random() * 0.4; // Random factor between 0.8 and 1.2
    return Math.round(basePrice * randomFactor * 100) / 100;
  }

  searchStocks(query: string): Observable<StockSearchResult[]> {
    if (!query.trim()) {
      return of([]);
    }

    if (this.dataModeService.isUsingMockData()) {
      return of(this.getMockSearchResults(query));
    }

    // Check cache first
    const cached = this.searchCache.get(query);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      console.log('Returning cached results for:', query);
      return of(cached.results);
    }

    this.enforceRateLimit();
    const url = environment.stockApiUrl;
    const params = {
      function: 'SYMBOL_SEARCH',
      keywords: query,
      apikey: environment.alphaVantageApiKey
    };

    console.log('Making request to:', url, 'with params:', { ...params, apikey: environment.alphaVantageApiKey.substring(0, 8) + '...' });

    return this.http.get<any>(url, { params }).pipe(
      tap(response => {
        console.log('Alpha Vantage API Response:', response);
        // Cache the results
        this.searchCache.set(query, {
          results: response.bestMatches.map((stock: any) => ({
            symbol: stock['1. symbol'],
            name: stock['2. name'],
            type: stock['3. type']
          })),
          timestamp: Date.now()
        });
      }),
      map(response => {
        if (!response.bestMatches || !Array.isArray(response.bestMatches)) {
          console.error('Invalid response format:', response);
          return [];
        }
        return response.bestMatches.map((stock: any) => ({
          symbol: stock['1. symbol'],
          name: stock['2. name'],
          type: stock['3. type']
        }));
      }),
      retryWhen(errors => errors.pipe(
        delayWhen(() => timer(this.RATE_LIMIT_DELAY)),
        tap(() => console.log('Retrying request after rate limit delay...'))
      )),
      catchError(error => {
        console.log('Error searching stocks, using mock data:', error);
        return of(this.getMockSearchResults(query));
      }),
      debounceTime(this.RATE_LIMIT_DELAY),
      shareReplay(1)
    );
  }

  private getMockSearchResults(query: string): StockSearchResult[] {
    const mockResults: StockSearchResult[] = [];
    const mockSymbols = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA'];
    
    mockSymbols.forEach(symbol => {
      if (symbol.toLowerCase().includes(query.toLowerCase()) || 
          symbol.toLowerCase().includes(query.toLowerCase())) {
        mockResults.push({
          symbol,
          name: `Mock ${symbol} Company`,
          type: 'Equity'
        });
      }
    });
    
    return mockResults;
  }

  getStockDetails(symbol: string): Observable<StockDetails> {
    if (this.dataModeService.isUsingMockData()) {
      return of(this.getMockStockDetails(symbol));
    }

    this.enforceRateLimit();
    const url = environment.stockApiUrl;
    const params = {
      function: 'OVERVIEW',
      symbol,
      apikey: environment.alphaVantageApiKey
    };

    console.log('Making request to:', url, 'with params:', { ...params, apikey: environment.alphaVantageApiKey.substring(0, 8) + '...' });

    return this.http.get<any>(url, { params }).pipe(
      tap(response => console.log('Alpha Vantage API Response:', response)),
      map(response => {
        if (!response) {
          throw new Error('No stock details found');
        }
        return {
          symbol: response.Symbol,
          name: response.Name,
          sector: response.Sector || 'N/A',
          industry: response.Industry || 'N/A',
          marketCap: parseFloat(response.MarketCapitalization) || 0,
          peRatio: parseFloat(response.PERatio) || 0,
          description: response.Description || 'No description available'
        };
      }),
      retryWhen(errors => errors.pipe(
        delayWhen(() => timer(this.RATE_LIMIT_DELAY)),
        tap(() => console.log('Retrying request after rate limit delay...'))
      )),
      catchError(error => {
        console.log('Error fetching stock details, using mock data:', error);
        return of(this.getMockStockDetails(symbol));
      }),
      shareReplay(1)
    );
  }

  private getMockStockDetails(symbol: string): StockDetails {
    return {
      symbol,
      name: `Mock ${symbol} Company`,
      sector: 'Technology',
      industry: 'Software',
      marketCap: 1000000000,
      peRatio: 25,
      description: `This is a mock description for ${symbol}`
    };
  }
} 