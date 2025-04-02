# Portfolio Management Application

A full-stack application for managing stock portfolios with real-time stock data.

## Prerequisites

- Java 17 or later
- Node.js and npm
- Maven (will be installed automatically by setup script)

## Setup Instructions

1. Clone the repository (if you haven't already)
2. Run the setup script:
   ```bash
   ./setup.sh
   ```
   This will:
   - Install Homebrew (if not present)
   - Install Maven (if not present)
   - Set up the Maven wrapper
   - Verify Java installation

## Running the Application

### Backend
```bash
cd backend/portfolio-service
./mvnw spring-boot:run
```
The backend will run on http://localhost:8080

### Frontend
```bash
cd frontend
npm start
```
The frontend will run on http://localhost:4200

## Troubleshooting

If you encounter any issues:

1. Make sure you're in the correct directory when running commands
2. Run the setup script again to ensure all dependencies are properly installed
3. Check that Java 17 is installed and JAVA_HOME is set correctly
4. Verify that ports 8080 and 4200 are not in use by other applications

## Features

- Real-time stock price updates using Alpha Vantage API
- Portfolio management with add/remove stocks
- Stock search functionality
- Portfolio performance tracking
- Responsive design
