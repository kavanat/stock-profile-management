# Stock Profile Management

A full-stack application for managing stock portfolios, built with Angular and Spring Boot.

## Features

- Create and manage stock portfolios
- Add and remove stocks from portfolios
- Track stock holdings and portfolio value
- Real-time stock data updates

## Tech Stack

### Frontend
- Angular 17
- TypeScript
- Angular Material
- RxJS

### Backend
- Spring Boot 3.2
- Java 17
- Spring Data JPA
- PostgreSQL
- Maven

## Prerequisites

- Node.js and npm
- Java 17
- PostgreSQL
- Maven

## Setup Instructions

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend/portfolio-service
   ```
2. Create a PostgreSQL database named `stock_profile_db`
3. Run the application:
   ```bash
   ./mvnw spring-boot:run
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the application:
   ```bash
   ng serve
   ```

## Accessing the Application

- Frontend: http://localhost:4200
- Backend API: http://localhost:8080

## Author

Kavana T (kavana.tad@gmail.com)
