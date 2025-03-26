import { StockHolding } from './stock-holding';

export interface Portfolio {
  id: number;
  name: string;
  holdings: StockHolding[];
  totalValue: number;
} 