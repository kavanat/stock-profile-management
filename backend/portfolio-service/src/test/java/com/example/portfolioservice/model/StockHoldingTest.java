package com.example.portfolioservice.model;

import org.testng.annotations.Test;
import static org.junit.jupiter.api.Assertions.*;

class StockHoldingTest {

    @Test
    void testStockHoldingCreation() {
        StockHolding stockHolding = new StockHolding();
        stockHolding.setSymbol("AAPL");
        stockHolding.setQuantity(10);
        stockHolding.setAveragePrice(150.0);
        stockHolding.setCurrentValue(1500.0);

        assertEquals("AAPL", stockHolding.getSymbol());
        assertEquals(10, stockHolding.getQuantity());
        assertEquals(150.0, stockHolding.getAveragePrice());
        assertEquals(1500.0, stockHolding.getCurrentValue());
        assertNull(stockHolding.getId());
        assertNull(stockHolding.getPortfolio());
    }

    @Test
    void testStockHoldingWithId() {
        StockHolding stockHolding = new StockHolding();
        stockHolding.setId(1L);
        stockHolding.setSymbol("GOOGL");
        stockHolding.setQuantity(5);
        stockHolding.setAveragePrice(2800.0);
        stockHolding.setCurrentValue(14000.0);

        assertEquals(1L, stockHolding.getId());
        assertEquals("GOOGL", stockHolding.getSymbol());
        assertEquals(5, stockHolding.getQuantity());
        assertEquals(2800.0, stockHolding.getAveragePrice());
        assertEquals(14000.0, stockHolding.getCurrentValue());
    }
}
