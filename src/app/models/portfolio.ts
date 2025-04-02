import { StockHolding } from './stock-holding';

export interface Portfolio {
  id: number;
  name: string;
  userId: string;
  holdings: StockHolding[];
  totalValue: number;
} 