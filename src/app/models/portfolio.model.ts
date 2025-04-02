import { StockHolding } from './stock-holding';

export interface Portfolio {
  id: number;
  name: string;
  userId: number;
  holdings: StockHolding[];
  totalValue: number;
  totalProfitLoss: number;
  totalProfitLossPercentage: number;
} 