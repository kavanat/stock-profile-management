package com.example.portfolioservice.config;

import com.example.portfolioservice.model.Portfolio;
import com.example.portfolioservice.model.StockHolding;
import com.example.portfolioservice.repository.PortfolioRepository;
import com.example.portfolioservice.service.MarketDataService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private PortfolioRepository portfolioRepository;

    @Autowired
    private MarketDataService marketDataService;

    @Override
    public void run(String... args) {
        // Create a sample portfolio
        Portfolio portfolio = new Portfolio();
        portfolio.setName("My First Portfolio");
        portfolio.setUserId("default-user");

        // Create sample stock holdings
        StockHolding apple = new StockHolding();
        apple.setSymbol("AAPL");
        apple.setQuantity(10);
        apple.setAveragePrice(150.00);
        apple.setCurrentValue(apple.getQuantity() * marketDataService.getCurrentPrice("AAPL"));
        apple.setPortfolio(portfolio);

        StockHolding google = new StockHolding();
        google.setSymbol("GOOGL");
        google.setQuantity(5);
        google.setAveragePrice(2800.00);
        google.setCurrentValue(google.getQuantity() * marketDataService.getCurrentPrice("GOOGL"));
        google.setPortfolio(portfolio);

        portfolio.setHoldings(Arrays.asList(apple, google));
        portfolio.setTotalValue(apple.getCurrentValue() + google.getCurrentValue());
        portfolioRepository.save(portfolio);
    }
} 