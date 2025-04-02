#!/bin/bash

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to install Homebrew if not present
install_homebrew() {
    if ! command_exists brew; then
        echo "Installing Homebrew..."
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    fi
}

# Function to install Maven if not present
install_maven() {
    if ! command_exists mvn; then
        echo "Installing Maven..."
        brew install maven
    fi
}

# Function to setup Maven wrapper
setup_maven_wrapper() {
    echo "Setting up Maven wrapper..."
    cd backend/portfolio-service
    if [ ! -f "mvnw" ]; then
        mvn -N wrapper:wrapper
    fi
    chmod +x mvnw
    cd ../..
}

# Function to check Java installation
check_java() {
    if ! command_exists java; then
        echo "Java is not installed. Please install Java 17 or later."
        exit 1
    fi
}

# Main setup process
echo "Starting setup process..."

# Check and install prerequisites
install_homebrew
install_maven
check_java

# Setup Maven wrapper
setup_maven_wrapper

echo "Setup completed successfully!"
echo "You can now run the application using:"
echo "1. Backend: cd backend/portfolio-service && ./mvnw spring-boot:run"
echo "2. Frontend: cd frontend && npm start" 