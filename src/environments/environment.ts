interface Environment {
  production: boolean;
  portfolioApiUrl: string;
  stockApiUrl: string;
  alphaVantageApiKey: string;
  useMockData: boolean;
}

export const environment: Environment = {
  production: false,
  portfolioApiUrl: 'http://localhost:8080/api/portfolios',
  stockApiUrl: 'https://www.alphavantage.co/query',
  alphaVantageApiKey: 'demo',
  useMockData: true // Set to false to use Alpha Vantage API
}; 