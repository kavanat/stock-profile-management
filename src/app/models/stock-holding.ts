export interface StockHolding {
  id: number;
  symbol: string;
  quantity: number;
  averagePrice: number;
  currentValue: number;
  portfolioId: number;
} 