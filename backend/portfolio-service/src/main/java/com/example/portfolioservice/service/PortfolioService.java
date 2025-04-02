package com.example.portfolioservice.service;

import com.example.portfolioservice.model.Portfolio;
import com.example.portfolioservice.model.StockHolding;
import com.example.portfolioservice.repository.PortfolioRepository;
import com.example.portfolioservice.repository.StockHoldingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

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

    @Transactional(readOnly = true)
    public List<Portfolio> getAllPortfolios(String userId) {
        List<Portfolio> portfolios = portfolioRepository.findByUserId(userId);
        portfolios.forEach(this::updateHoldingsCurrentValues);
        return portfolios;
    }

    @Transactional
    public Portfolio createPortfolio(String name, String userId) {
        Portfolio portfolio = new Portfolio();
        portfolio.setName(name);
        portfolio.setUserId(userId);
        return portfolioRepository.save(portfolio);
    }

    @Transactional(readOnly = true)
    public Portfolio getPortfolio(Long id) {
        Portfolio portfolio = portfolioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Portfolio not found"));
        updateHoldingsCurrentValues(portfolio);
        return portfolio;
    }

    @Transactional
    public StockHolding addStock(Long portfolioId, String symbol, Integer quantity, Double price) {
        if (quantity <= 0 || price <= 0) {
            throw new RuntimeException("Quantity and price must be positive");
        }

        Portfolio portfolio = getPortfolio(portfolioId);
        
        // Check if stock already exists in portfolio
        Optional<StockHolding> existingHolding = stockHoldingRepository.findByPortfolioIdAndSymbol(portfolioId, symbol);
        StockHolding holding;
        
        if (existingHolding.isPresent()) {
            holding = existingHolding.get();
            // Update existing holding
            int newQuantity = holding.getQuantity() + quantity;
            double newAveragePrice = calculateNewAveragePrice(holding, quantity, price);
            
            holding.setQuantity(newQuantity);
            holding.setAveragePrice(newAveragePrice);
        } else {
            // Create new holding
            holding = new StockHolding();
            holding.setPortfolio(portfolio);
            holding.setSymbol(symbol);
            holding.setQuantity(quantity);
            holding.setAveragePrice(price);
            portfolio.getHoldings().add(holding);
        }
        
        // Update current value with real-time price
        Double currentPrice = marketDataService.getCurrentPrice(symbol);
        holding.setCurrentValue(holding.getQuantity() * currentPrice);
        
        // Save the holding first
        holding = stockHoldingRepository.save(holding);
        
        // Update portfolio total value
        updatePortfolioTotalValue(portfolio);
        
        return holding;
    }

    private double calculateNewAveragePrice(StockHolding existing, Integer newQuantity, Double newPrice) {
        double totalValue = (existing.getQuantity() * existing.getAveragePrice()) + (newQuantity * newPrice);
        return totalValue / (existing.getQuantity() + newQuantity);
    }

    @Transactional
    public void removeStock(Long portfolioId, String symbol) {
        // First check if the stock exists
        Optional<StockHolding> holding = stockHoldingRepository.findByPortfolioIdAndSymbol(portfolioId, symbol);
        if (holding.isEmpty()) {
            throw new RuntimeException("Stock not found in portfolio");
        }
        
        // Get the portfolio and remove the holding from its collection
        Portfolio portfolio = portfolioRepository.findById(portfolioId)
                .orElseThrow(() -> new RuntimeException("Portfolio not found"));
        
        // Remove the holding from the portfolio's holdings collection
        portfolio.getHoldings().removeIf(h -> h.getSymbol().equals(symbol));
        
        // Delete the stock holding
        stockHoldingRepository.deleteByPortfolioIdAndSymbol(portfolioId, symbol);
        
        // Update total value based on remaining holdings
        if (portfolio.getHoldings() != null && !portfolio.getHoldings().isEmpty()) {
            Double totalValue = portfolio.getHoldings().stream()
                    .mapToDouble(StockHolding::getCurrentValue)
                    .sum();
            portfolio.setTotalValue(totalValue);
        } else {
            portfolio.setTotalValue(0.0);
        }
        
        portfolioRepository.save(portfolio);
    }

    @Transactional(readOnly = true)
    public List<StockHolding> getPortfolioHoldings(Long portfolioId) {
        Portfolio portfolio = getPortfolio(portfolioId);
        updateHoldingsCurrentValues(portfolio);
        return portfolio.getHoldings();
    }

    private void updateHoldingsCurrentValues(Portfolio portfolio) {
        for (StockHolding holding : portfolio.getHoldings()) {
            Double currentPrice = marketDataService.getCurrentPrice(holding.getSymbol());
            holding.setCurrentValue(holding.getQuantity() * currentPrice);
        }
        updatePortfolioTotalValue(portfolio);
    }

    private void updatePortfolioTotalValue(Portfolio portfolio) {
        Double totalValue = portfolio.getHoldings().stream()
                .mapToDouble(StockHolding::getCurrentValue)
                .sum();
        portfolio.setTotalValue(totalValue);
        portfolioRepository.save(portfolio);
    }
} 