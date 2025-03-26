package com.example.portfolioservice.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class MarketDataService {
    private static final Logger logger = LoggerFactory.getLogger(MarketDataService.class);
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final Random random = new Random();
    
    // Mock stock prices with some variation
    private static final Map<String, Double> MOCK_PRICES = new HashMap<>();
    static {
        MOCK_PRICES.put("AAPL", 175.50);
        MOCK_PRICES.put("GOOGL", 145.20);
        MOCK_PRICES.put("MSFT", 425.30);
        MOCK_PRICES.put("AMZN", 180.75);
        MOCK_PRICES.put("META", 485.25);
        MOCK_PRICES.put("TSLA", 175.80);
        MOCK_PRICES.put("NVDA", 925.40);
        MOCK_PRICES.put("JPM", 180.25);
        MOCK_PRICES.put("V", 280.50);
        MOCK_PRICES.put("WMT", 60.15);
    }

    public Double getCurrentPrice(String symbol) {
        // Convert symbol to uppercase for consistency
        symbol = symbol.toUpperCase();
        
        // Get base price from mock data
        Double basePrice = MOCK_PRICES.getOrDefault(symbol, 100.0);
        
        // Add some random variation (±5%)
        double variation = basePrice * (random.nextDouble() * 0.1 - 0.05);
        
        // Round to 2 decimal places
        return Math.round((basePrice + variation) * 100.0) / 100.0;
    }
} 