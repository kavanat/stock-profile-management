package com.example.portfolioservice.controller;

import com.example.portfolioservice.model.Portfolio;
import com.example.portfolioservice.model.StockHolding;
import com.example.portfolioservice.service.PortfolioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/portfolios")
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:4201"})
@Tag(name = "Portfolio Controller", description = "APIs for managing stock portfolios")
public class PortfolioController {
    private final PortfolioService portfolioService;

    public PortfolioController(PortfolioService portfolioService) {
        this.portfolioService = portfolioService;
    }

    @Operation(summary = "Get all portfolios for a user", description = "Retrieves all portfolios for the specified user")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Portfolios retrieved successfully")
    })
    @GetMapping
    public ResponseEntity<List<Portfolio>> getAllPortfolios(
            @Parameter(description = "ID of the user") 
            @RequestParam String userId) {
        return ResponseEntity.ok(portfolioService.getAllPortfolios(userId));
    }

    @Operation(summary = "Create a new portfolio", description = "Creates a new portfolio with the given name")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Portfolio created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input")
    })
    @PostMapping
    public ResponseEntity<Portfolio> createPortfolio(
            @Parameter(description = "Name of the portfolio") 
            @RequestParam String name,
            @Parameter(description = "ID of the user")
            @RequestParam String userId) {
        return ResponseEntity.ok(portfolioService.createPortfolio(name, userId));
    }

    @Operation(summary = "Get portfolio by ID", description = "Retrieves a portfolio by its ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Portfolio found"),
        @ApiResponse(responseCode = "404", description = "Portfolio not found")
    })
    @GetMapping("/{id}")
    public ResponseEntity<Portfolio> getPortfolio(
            @Parameter(description = "ID of the portfolio") 
            @PathVariable Long id) {
        return ResponseEntity.ok(portfolioService.getPortfolio(id));
    }

    @Operation(summary = "Add stock to portfolio", description = "Adds a new stock to an existing portfolio")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Stock added successfully"),
        @ApiResponse(responseCode = "404", description = "Portfolio not found"),
        @ApiResponse(responseCode = "400", description = "Invalid input")
    })
    @PostMapping("/{portfolioId}/stocks")
    public ResponseEntity<StockHolding> addStock(
            @Parameter(description = "ID of the portfolio") 
            @PathVariable Long portfolioId,
            @Parameter(description = "Stock symbol (e.g., AAPL)") 
            @RequestParam String symbol,
            @Parameter(description = "Number of shares") 
            @RequestParam Integer quantity,
            @Parameter(description = "Price per share") 
            @RequestParam Double price) {
        return ResponseEntity.ok(portfolioService.addStock(portfolioId, symbol, quantity, price));
    }

    @Operation(summary = "Remove stock from portfolio", description = "Removes a stock from an existing portfolio")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Stock removed successfully"),
        @ApiResponse(responseCode = "404", description = "Portfolio or stock not found")
    })
    @DeleteMapping("/{portfolioId}/stocks/{symbol}")
    public ResponseEntity<Void> removeStock(
            @Parameter(description = "ID of the portfolio") 
            @PathVariable Long portfolioId,
            @Parameter(description = "Stock symbol to remove") 
            @PathVariable String symbol) {
        portfolioService.removeStock(portfolioId, symbol);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Get portfolio holdings", description = "Retrieves all stock holdings in a portfolio")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Holdings retrieved successfully"),
        @ApiResponse(responseCode = "404", description = "Portfolio not found")
    })
    @GetMapping("/{portfolioId}/holdings")
    public ResponseEntity<List<StockHolding>> getPortfolioHoldings(
            @Parameter(description = "ID of the portfolio") 
            @PathVariable Long portfolioId) {
        return ResponseEntity.ok(portfolioService.getPortfolioHoldings(portfolioId));
    }
}
