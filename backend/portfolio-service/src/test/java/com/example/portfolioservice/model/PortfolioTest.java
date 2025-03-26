package com.example.portfolioservice.model;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class PortfolioTest {

    @Test
    void testPortfolioCreation() {
        Portfolio portfolio = new Portfolio();
        portfolio.setName("Test Portfolio");
        portfolio.setTotalValue(1000.0);

        assertEquals("Test Portfolio", portfolio.getName());
        assertEquals(1000.0, portfolio.getTotalValue());
        assertNull(portfolio.getId());
    }

    @Test
    void testPortfolioWithId() {
        Portfolio portfolio = new Portfolio();
        portfolio.setId(1L);
        portfolio.setName("Test Portfolio");
        portfolio.setTotalValue(1000.0);

        assertEquals(1L, portfolio.getId());
        assertEquals("Test Portfolio", portfolio.getName());
        assertEquals(1000.0, portfolio.getTotalValue());
    }
} 