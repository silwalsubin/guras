#!/bin/bash

# Flyway Setup Script for Guras Project
# This script helps you set up Flyway configuration for different environments

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Flyway Setup for Guras Project${NC}"
echo ""

# Check if Flyway is installed
if ! command -v flyway &> /dev/null; then
    echo -e "${RED}❌ Flyway is not installed.${NC}"
    echo -e "${YELLOW}Installing Flyway...${NC}"
    brew install flyway
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Flyway installed successfully!${NC}"
    else
        echo -e "${RED}❌ Failed to install Flyway. Please install manually:${NC}"
        echo "   brew install flyway"
        exit 1
    fi
else
    echo -e "${GREEN}✅ Flyway is already installed${NC}"
    flyway --version
fi

echo ""

# Show available configuration files
echo -e "${BLUE}📁 Available configuration files:${NC}"
ls -la flyway.*.conf 2>/dev/null || echo "No environment configs found"

echo ""

# Check if migrations directory exists
if [ ! -d "database/migrations" ]; then
    echo -e "${YELLOW}⚠️  Migrations directory not found. Creating...${NC}"
    mkdir -p database/migrations
    echo -e "${GREEN}✅ Created database/migrations directory${NC}"
else
    echo -e "${GREEN}✅ Migrations directory exists${NC}"
fi

echo ""

# Show usage instructions
echo -e "${BLUE}📖 Usage Instructions:${NC}"
echo ""
echo -e "${YELLOW}1. For Staging Environment:${NC}"
echo "   ./scripts/migrate.sh staging true    # Dry run"
echo "   ./scripts/migrate.sh staging false   # Apply migrations"
echo ""
echo -e "${YELLOW}2. For Local Development:${NC}"
echo "   ./scripts/migrate.sh local true      # Dry run"
echo "   ./scripts/migrate.sh local false     # Apply migrations"
echo ""
echo -e "${YELLOW}3. Test Database Connection:${NC}"
echo "   ./scripts/test-db-connection.sh"
echo ""
echo -e "${YELLOW}4. Manual Flyway Commands:${NC}"
echo "   flyway -configFiles=flyway.staging.conf info"
echo "   flyway -configFiles=flyway.staging.conf migrate"
echo ""

# Check if staging config exists and test connection
if [ -f "flyway.staging.conf" ]; then
    echo -e "${BLUE}🔍 Testing staging connection...${NC}"
    echo -e "${YELLOW}Note: This will only work after your IP is whitelisted in RDS${NC}"
    echo ""
    
    echo -e "${BLUE}Testing connection...${NC}"
    flyway -configFiles=flyway.staging.conf info
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Connection successful!${NC}"
    else
        echo -e "${RED}❌ Connection failed. Your IP may not be whitelisted yet.${NC}"
        echo -e "${YELLOW}Deploy Terraform changes first, then try again.${NC}"
    fi
fi

echo ""
echo -e "${GREEN}✅ Setup complete!${NC}"
echo -e "${BLUE}Next steps:${NC}"
echo "1. Deploy Terraform changes to whitelist your IP"
echo "2. Test connection with: ./scripts/test-db-connection.sh"
echo "3. Run migrations with: ./scripts/migrate.sh staging true"
