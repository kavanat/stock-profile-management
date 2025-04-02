package com.example.portfolioservice.model;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
public class AddStockRequest {
    private String symbol;
    private Integer quantity;
    private Double price;
} 