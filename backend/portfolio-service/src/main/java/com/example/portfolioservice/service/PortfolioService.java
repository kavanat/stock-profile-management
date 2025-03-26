package com.example.portfolioservice.service;

import com.example.portfolioservice.model.Portfolio;
import com.example.portfolioservice.model.StockHolding;
import com.example.portfolioservice.repository.PortfolioRepository;
import com.example.portfolioservice.repository.StockHoldingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PortfolioService {
    private final PortfolioRepository portfolioRepository;
    private final StockHoldingRepository stockHoldingRepository;
    private final MarketDataService marketDataService;

    public PortfolioService(PortfolioRepository portfolioRepository,
                          StockHoldingRepository stockHoldingRepository,
                          MarketDataService marketDataService) {
        this.portfolioRepository = portfolioRepository;
        this.stockHoldingRepository = stockHoldingRepository;
        this.marketDataService = marketDataService;
    }

    @Transactional
    public Portfolio createPortfolio(String name) {
        Portfolio portfolio = new Portfolio();
        portfolio.setName(name);
        return portfolioRepository.save(portfolio);
    }

    @Transactional(readOnly = true)
    public Portfolio getPortfolio(Long id) {
        return portfolioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Portfolio not found"));
    }

    @Transactional
    public StockHolding addStock(Long portfolioId, String symbol, Integer quantity, Double price) {
        Portfolio portfolio = getPortfolio(portfolioId);
        
        // Check if stock already exists in portfolio
        StockHolding holding = stockHoldingRepository.findByPortfolioIdAndSymbol(portfolioId, symbol)
                .orElse(new StockHolding());
        
        if (holding.getId() == null) {
            // New stock holding
            holding.setPortfolio(portfolio);
            holding.setSymbol(symbol);
            holding.setQuantity(quantity);
            holding.setAveragePrice(price);
            portfolio.getHoldings().add(holding);
        } else {
            // Update existing holding
            int newQuantity = holding.getQuantity() + quantity;
            double newAveragePrice = calculateNewAveragePrice(holding, quantity, price);
            
            holding.setQuantity(newQuantity);
            holding.setAveragePrice(newAveragePrice);
        }
        
        // Update current value with real-time price
        Double currentPrice = marketDataService.getCurrentPrice(symbol);
        holding.setCurrentValue(holding.getQuantity() * currentPrice);
        
        updatePortfolioTotalValue(portfolio);
        return stockHoldingRepository.save(holding);
    }

    private double calculateNewAveragePrice(StockHolding existing, Integer newQuantity, Double newPrice) {
        double totalValue = (existing.getQuantity() * existing.getAveragePrice()) + (newQuantity * newPrice);
        return totalValue / (existing.getQuantity() + newQuantity);
    }

    @Transactional
    public void removeStock(Long portfolioId, String symbol) {
        stockHoldingRepository.deleteByPortfolioIdAndSymbol(portfolioId, symbol);
        Portfolio portfolio = getPortfolio(portfolioId);
        updatePortfolioTotalValue(portfolio);
    }

    @Transactional(readOnly = true)
    public List<StockHolding> getPortfolioHoldings(Long portfolioId) {
        return stockHoldingRepository.findByPortfolioId(portfolioId);
    }

    private void updatePortfolioTotalValue(Portfolio portfolio) {
        Double totalValue = portfolio.getHoldings().stream()
                .mapToDouble(StockHolding::getCurrentValue)
                .sum();
        portfolio.setTotalValue(totalValue);
        portfolioRepository.save(portfolio);
    }
} 