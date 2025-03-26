package com.example.portfolioservice.controller;

import com.example.portfolioservice.model.Portfolio;
import com.example.portfolioservice.model.StockHolding;
import com.example.portfolioservice.service.PortfolioService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/portfolios")
@CrossOrigin(origins = "http://localhost:4200")
public class PortfolioController {
    private final PortfolioService portfolioService;

    public PortfolioController(PortfolioService portfolioService) {
        this.portfolioService = portfolioService;
    }

    @PostMapping
    public ResponseEntity<Portfolio> createPortfolio(@RequestParam String name) {
        return ResponseEntity.ok(portfolioService.createPortfolio(name));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Portfolio> getPortfolio(@PathVariable Long id) {
        return ResponseEntity.ok(portfolioService.getPortfolio(id));
    }

    @PostMapping("/{portfolioId}/stocks")
    public ResponseEntity<StockHolding> addStock(
            @PathVariable Long portfolioId,
            @RequestParam String symbol,
            @RequestParam Integer quantity,
            @RequestParam Double price) {
        return ResponseEntity.ok(portfolioService.addStock(portfolioId, symbol, quantity, price));
    }

    @DeleteMapping("/{portfolioId}/stocks/{symbol}")
    public ResponseEntity<Void> removeStock(
            @PathVariable Long portfolioId,
            @PathVariable String symbol) {
        portfolioService.removeStock(portfolioId, symbol);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{portfolioId}/holdings")
    public ResponseEntity<List<StockHolding>> getPortfolioHoldings(@PathVariable Long portfolioId) {
        return ResponseEntity.ok(portfolioService.getPortfolioHoldings(portfolioId));
    }
} 