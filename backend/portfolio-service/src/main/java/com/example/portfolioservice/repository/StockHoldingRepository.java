package com.example.portfolioservice.repository;

import com.example.portfolioservice.model.StockHolding;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StockHoldingRepository extends JpaRepository<StockHolding, Long> {
    List<StockHolding> findByPortfolioId(Long portfolioId);
    void deleteByPortfolioIdAndSymbol(Long portfolioId, String symbol);
    Optional<StockHolding> findByPortfolioIdAndSymbol(Long portfolioId, String symbol);
} 