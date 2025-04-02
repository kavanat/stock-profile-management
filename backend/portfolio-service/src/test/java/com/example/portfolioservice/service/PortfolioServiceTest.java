package com.example.portfolioservice.service;

import com.example.portfolioservice.model.Portfolio;
import com.example.portfolioservice.model.StockHolding;
import com.example.portfolioservice.repository.PortfolioRepository;
import com.example.portfolioservice.repository.StockHoldingRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PortfolioServiceTest {

    @Mock
    private PortfolioRepository portfolioRepository;

    @Mock
    private StockHoldingRepository stockHoldingRepository;

    @Mock
    private MarketDataService marketDataService;

    @InjectMocks
    private PortfolioService portfolioService;

    private Portfolio testPortfolio;

    @BeforeEach
    void setUp() {
        testPortfolio = new Portfolio();
        testPortfolio.setId(1L);
        testPortfolio.setName("Test Portfolio");
        testPortfolio.setTotalValue(0.0);
    }

    @Test
    void testCreatePortfolio() {
        // Arrange
        Portfolio inputPortfolio = new Portfolio();
        inputPortfolio.setName("Test Portfolio");
        inputPortfolio.setUserId("testUser");
        inputPortfolio.setTotalValue(0.0);
        
        when(portfolioRepository.save(any(Portfolio.class))).thenReturn(testPortfolio);

        // Act
        Portfolio created = portfolioService.createPortfolio(inputPortfolio);

        // Assert
        assertNotNull(created);
        assertEquals("Test Portfolio", created.getName());
        verify(portfolioRepository).save(any(Portfolio.class));
    }

    @Test
    void testGetPortfolio() {
        when(portfolioRepository.findById(1L)).thenReturn(Optional.of(testPortfolio));

        Portfolio found = portfolioService.getPortfolio(1L);

        assertNotNull(found);
        assertEquals(1L, found.getId());
        assertEquals("Test Portfolio", found.getName());
        assertEquals(0.0, found.getTotalValue());
        verify(portfolioRepository).findById(1L);
    }

    @Test
    void testAddStock() {
        when(portfolioRepository.findById(1L)).thenReturn(Optional.of(testPortfolio));
        when(marketDataService.getCurrentPrice(anyString())).thenReturn(150.0);
        when(stockHoldingRepository.save(any(StockHolding.class))).thenAnswer(invocation -> {
            StockHolding stock = invocation.getArgument(0);
            stock.setId(1L);
            return stock;
        });

        StockHolding stock = portfolioService.addStock(1L, "AAPL", 10, 150.0);

        assertNotNull(stock);
        assertEquals("AAPL", stock.getSymbol());
        assertEquals(10, stock.getQuantity());
        assertEquals(150.0, stock.getAveragePrice());
        assertEquals(1500.0, stock.getCurrentValue());
        assertEquals(testPortfolio, stock.getPortfolio());
        verify(stockHoldingRepository).save(any(StockHolding.class));
        verify(marketDataService).getCurrentPrice("AAPL");
    }

    @Test
    void createPortfolio_Success() {
        // Arrange
        Portfolio portfolio = new Portfolio();
        portfolio.setName("Test Portfolio");
        portfolio.setUserId("testUser");
        portfolio.setTotalValue(0.0);
        
        when(portfolioRepository.save(any(Portfolio.class))).thenReturn(portfolio);
        
        // Act
        Portfolio result = portfolioService.createPortfolio(portfolio);
        
        // Assert
        assertNotNull(result);
        assertEquals("Test Portfolio", result.getName());
        assertEquals("testUser", result.getUserId());
        assertEquals(0.0, result.getTotalValue());
        verify(portfolioRepository).save(any(Portfolio.class));
    }
} 