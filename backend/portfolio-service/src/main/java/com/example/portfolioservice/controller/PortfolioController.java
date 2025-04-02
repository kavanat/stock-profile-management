package com.example.portfolioservice.controller;

import com.example.portfolioservice.model.AddStockRequest;
import com.example.portfolioservice.model.Portfolio;
import com.example.portfolioservice.model.StockHolding;
import com.example.portfolioservice.service.PortfolioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
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

    @PostMapping
    @Operation(summary = "Create a new portfolio")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Portfolio created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input")
    })
    public ResponseEntity<Portfolio> createPortfolio(@RequestBody Portfolio portfolio) {
        Portfolio createdPortfolio = portfolioService.createPortfolio(portfolio);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdPortfolio);
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
            @Parameter(description = "Stock details")
            @RequestBody AddStockRequest request) {
        return ResponseEntity.ok(portfolioService.addStock(portfolioId, request.getSymbol(), request.getQuantity(), request.getPrice()));
    }

    @DeleteMapping("/{portfolioId}/stocks/{symbol}")
    @Operation(
        summary = "Remove stock from portfolio",
        description = "Removes a stock from an existing portfolio. Query param 'reduce' is optional and ignored for now."
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Stock removed successfully"),
        @ApiResponse(responseCode = "404", description = "Portfolio or stock not found")
    })
    public ResponseEntity<Portfolio> removeStock(
        @PathVariable Long portfolioId,
        @PathVariable String symbol,
        @RequestParam(required = false) Integer reduce) {
        if (reduce != null) {
            portfolioService.reduceStockQuantity(portfolioId, symbol, reduce);
        } else {
            portfolioService.removeStock(portfolioId, symbol);
        }
        return ResponseEntity.ok(portfolioService.getPortfolio(portfolioId));
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

    @Operation(summary = "Reduce stock quantity", description = "Reduces the quantity of a stock in a portfolio")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Stock quantity reduced successfully"),
        @ApiResponse(responseCode = "404", description = "Portfolio or stock not found"),
        @ApiResponse(responseCode = "400", description = "Invalid input")
    })
    @PutMapping("/{portfolioId}/stocks/{symbol}/reduce")
    public ResponseEntity<StockHolding> reduceStockQuantity(
            @Parameter(description = "ID of the portfolio")
            @PathVariable Long portfolioId,
            @Parameter(description = "Stock symbol to reduce")
            @PathVariable String symbol,
            @Parameter(description = "Quantity to reduce")
            @RequestParam Integer quantity) {
        return ResponseEntity.ok(portfolioService.reduceStockQuantity(portfolioId, symbol, quantity));
    }
}
