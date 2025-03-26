package com.example.portfolioservice.config;

import com.example.portfolioservice.model.Portfolio;
import com.example.portfolioservice.model.StockHolding;
import com.example.portfolioservice.repository.PortfolioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private PortfolioRepository portfolioRepository;

    @Override
    public void run(String... args) {
        // Create a sample portfolio
        Portfolio portfolio = new Portfolio();
        portfolio.setName("My First Portfolio");

        // Create sample stock holdings
        StockHolding apple = new StockHolding();
        apple.setSymbol("AAPL");
        apple.setQuantity(10);
        apple.setAveragePrice(150.00);
        apple.setPortfolio(portfolio);

        StockHolding google = new StockHolding();
        google.setSymbol("GOOGL");
        google.setQuantity(5);
        google.setAveragePrice(2800.00);
        google.setPortfolio(portfolio);

        portfolio.setHoldings(Arrays.asList(apple, google));
        portfolioRepository.save(portfolio);
    }
} 