package com.example.portfolioservice.service;

import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.Map;

@Service
public class MarketDataService {
    private final Map<String, Double> stockPrices = new HashMap<>();

    public MarketDataService() {
        // Initialize with some sample prices
        stockPrices.put("AAPL", 175.50);
        stockPrices.put("GOOGL", 145.20);
        stockPrices.put("MSFT", 425.30);
        stockPrices.put("AMZN", 180.75);
        stockPrices.put("META", 485.25);
        stockPrices.put("TSLA", 175.80);
        stockPrices.put("NVDA", 925.40);
        stockPrices.put("JPM", 180.25);
        stockPrices.put("V", 280.50);
        stockPrices.put("WMT", 60.15);
    }

    public Double getCurrentPrice(String symbol) {
        Double price = stockPrices.get(symbol);
        if (price == null) {
            // For unknown stocks, generate a random price between 10 and 1000
            price = 10.0 + Math.random() * 990.0;
            stockPrices.put(symbol, price);
        }
        return price;
    }

    public void updatePrice(String symbol, Double price) {
        stockPrices.put(symbol, price);
    }
} 