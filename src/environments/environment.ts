interface Environment {
  production: boolean;
  portfolioApiUrl: string;
  stockApiUrl: string;
  alphaVantageApiKey: string;
  useMockData: boolean;
  apiUrl: string;
  finnhubApiUrl: string;
  finnhubApiKey: string;
}

export const environment: Environment = {
  production: false,
  portfolioApiUrl: 'http://localhost:8080/api/portfolios',
  stockApiUrl: 'https://www.alphavantage.co/query',
  alphaVantageApiKey: 'demo',
  useMockData: true, // Set to false to use Alpha Vantage API
  apiUrl: 'http://localhost:8080/api',
  finnhubApiUrl: 'https://finnhub.io/api/v1',
  finnhubApiKey: 'cvmh459r01qltjkglgcgcvmh459r01qltjkglgd0'
}; 