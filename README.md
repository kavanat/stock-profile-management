# Stock Portfolio Tracker

A full-stack application for tracking and managing your stock portfolio. Built with Angular and Spring Boot.

## Features

- 📈 Real-time stock price tracking
- 💼 Manage Portfolio
- 🔍 Search and add stocks to your portfolio
- 📊 Track portfolio performance
- 🗑️ Delete or reduce stock holdings
- ⚠️ Warning system for high-value stocks
- 🔒 Secure API access

## Prerequisites

- Node.js (v16 or higher)
- Java 17 or higher
- Maven
- Angular CLI

## Quick Start

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Start the backend services:
   ```bash
   ./mvnw spring-boot:run
   ```

The backend will run on `http://localhost:8080`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   ng serve
   ```

The application will be available at `http://localhost:4200`

## How to Use

### Adding Stocks

1. See the user portfolio
2. Click "Add Stock"
3. Search for a stock by symbol (e.g., AAPL, GOOGL)
4. Select the stock from the dropdown
5. Enter the quantity you want to add
6. Click "Add to Portfolio"

### Managing Stocks

- **View Details**: Click on any stock to see detailed information
- **Delete Stock**: Click the delete icon next to a stock
- **Reduce Quantity**: Click the reduce icon and enter the amount to reduce
- **Track Performance**: View your portfolio's total value and profit/loss

### Important Notes

- High-value stocks (>$1000) will show a warning message
- Some stocks may require special permissions to access
- Stock prices are updated in real-time

## Troubleshooting

If you encounter any issues:

1. Check if both backend and frontend services are running
2. Verify your internet connection
3. Clear your browser cache
4. Check the browser console for error messages
