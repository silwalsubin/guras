#!/bin/bash

# Guras Database Migration Tool
# Usage: ./scripts/migrate.sh [environment] [dry_run]
# Example: ./scripts/migrate.sh staging true

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
ENVIRONMENT=${1:-staging}
DRY_RUN=${2:-false}

# Configuration file mapping
case $ENVIRONMENT in
    "staging")
        CONFIG_FILE="flyway.staging.conf"
        ;;
    "local")
        CONFIG_FILE="flyway.local.conf"
        ;;
    *)
        echo -e "${RED}❌ Invalid environment: $ENVIRONMENT${NC}"
        echo "Valid environments: staging, local"
        exit 1
        ;;
esac

echo -e "${BLUE}🚀 Guras Database Migration Tool${NC}"
echo "Environment: $ENVIRONMENT"
echo "Dry Run: $DRY_RUN"
echo "Config: $CONFIG_FILE"
echo ""

# Check if Flyway is installed
if ! command -v flyway &> /dev/null; then
    echo -e "${RED}❌ Flyway is not installed. Please install it first:${NC}"
    echo "   brew install flyway"
    exit 1
fi

# Check if config file exists
if [ ! -f "$CONFIG_FILE" ]; then
    echo -e "${RED}❌ Configuration file not found: $CONFIG_FILE${NC}"
    echo "Please create the configuration file first."
    exit 1
fi

# Check if migrations directory exists
if [ ! -d "database/migrations" ]; then
    echo -e "${RED}❌ Migrations directory not found: database/migrations${NC}"
    exit 1
fi

echo -e "${BLUE}📁 Migrations directory: database/migrations${NC}"
echo -e "${BLUE}🔧 Using config: $CONFIG_FILE${NC}"
echo ""

# List available migrations
echo -e "${BLUE}📋 Available migrations:${NC}"
ls -la database/migrations/
echo ""

# Show current database state
echo -e "${BLUE}📊 Current database state:${NC}"
flyway -configFiles=$CONFIG_FILE info
echo ""

if [ "$DRY_RUN" = "true" ]; then
    echo -e "${YELLOW}🔍 DRY RUN MODE - Validating migrations only${NC}"
    echo -e "${YELLOW}No changes will be made to the database${NC}"
    
    # Validate migrations
    echo -e "${BLUE}🔍 Validating migrations...${NC}"
    flyway -configFiles=$CONFIG_FILE validate
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Validation completed successfully!${NC}"
    else
        echo -e "${RED}❌ Validation failed!${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠️  WARNING: This will apply migrations to the database!${NC}"
    echo -e "${YELLOW}Environment: $ENVIRONMENT${NC}"
    echo ""
    
    echo -e "${BLUE}🚀 Running migrations...${NC}"
    flyway -configFiles=$CONFIG_FILE migrate
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Migrations completed successfully!${NC}"
        
        echo ""
        echo -e "${BLUE}📊 Updated database state:${NC}"
        flyway -configFiles=$CONFIG_FILE info
    else
        echo -e "${RED}❌ Migration failed!${NC}"
        exit 1
    fi
fi
