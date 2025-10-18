#!/bin/bash

# Flyway Installation Script for CI/CD Environments
# This script downloads and installs Flyway CLI for GitHub Actions and other CI environments

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Installing Flyway CLI for CI/CD${NC}"

# Flyway version to install
FLYWAY_VERSION="9.22.3"
FLYWAY_URL="https://repo1.maven.org/maven2/org/flywaydb/flyway-commandline/${FLYWAY_VERSION}/flyway-commandline-${FLYWAY_VERSION}.tar.gz"

# Create temporary directory
TEMP_DIR=$(mktemp -d)
cd "$TEMP_DIR"

echo -e "${YELLOW}📥 Downloading Flyway ${FLYWAY_VERSION}...${NC}"

# Download Flyway with proper error handling
if ! curl -L -o flyway.tar.gz "$FLYWAY_URL"; then
    echo -e "${RED}❌ Failed to download Flyway from primary URL${NC}"
    echo -e "${YELLOW}🔄 Trying alternative download method...${NC}"
    
    # Alternative download method using wget if curl fails
    if ! wget -O flyway.tar.gz "$FLYWAY_URL"; then
        echo -e "${RED}❌ Failed to download Flyway from both methods${NC}"
        echo -e "${YELLOW}💡 Trying direct GitHub release...${NC}"
        
        # Try GitHub releases as fallback
        GITHUB_URL="https://github.com/flyway/flyway/releases/download/${FLYWAY_VERSION}/flyway-commandline-${FLYWAY_VERSION}.tar.gz"
        if ! curl -L -o flyway.tar.gz "$GITHUB_URL"; then
            echo -e "${RED}❌ All download methods failed${NC}"
            echo -e "${YELLOW}Available versions can be found at: https://github.com/flyway/flyway/releases${NC}"
            exit 1
        fi
    fi
fi

echo -e "${GREEN}✅ Download completed${NC}"

# Verify the downloaded file
echo -e "${YELLOW}🔍 Verifying downloaded file...${NC}"
if [ ! -f "flyway.tar.gz" ]; then
    echo -e "${RED}❌ Downloaded file not found${NC}"
    exit 1
fi

# Check file size (should be reasonable for Flyway)
FILE_SIZE=$(stat -c%s flyway.tar.gz 2>/dev/null || stat -f%z flyway.tar.gz 2>/dev/null || echo "0")
if [ "$FILE_SIZE" -lt 1000 ]; then
    echo -e "${RED}❌ Downloaded file is too small (${FILE_SIZE} bytes). It might be an error page.${NC}"
    echo -e "${YELLOW}File contents:${NC}"
    head -5 flyway.tar.gz
    exit 1
fi

echo -e "${GREEN}✅ File verification passed (${FILE_SIZE} bytes)${NC}"

# Extract Flyway
echo -e "${YELLOW}📦 Extracting Flyway...${NC}"
if ! tar -xzf flyway.tar.gz; then
    echo -e "${RED}❌ Failed to extract Flyway archive${NC}"
    echo -e "${YELLOW}File type:${NC}"
    file flyway.tar.gz
    exit 1
fi

echo -e "${GREEN}✅ Extraction completed${NC}"

# Find the extracted directory
FLYWAY_DIR=$(find . -name "flyway-*" -type d | head -1)
if [ -z "$FLYWAY_DIR" ]; then
    echo -e "${RED}❌ Could not find Flyway directory after extraction${NC}"
    echo -e "${YELLOW}Contents of current directory:${NC}"
    ls -la
    exit 1
fi

echo -e "${GREEN}✅ Found Flyway directory: ${FLYWAY_DIR}${NC}"

# Install Flyway to /usr/local/bin
echo -e "${YELLOW}🔧 Installing Flyway to /usr/local/bin...${NC}"
sudo cp "${FLYWAY_DIR}/flyway" /usr/local/bin/
sudo chmod +x /usr/local/bin/flyway

# Verify installation
echo -e "${YELLOW}🔍 Verifying installation...${NC}"
if command -v flyway &> /dev/null; then
    echo -e "${GREEN}✅ Flyway installed successfully!${NC}"
    flyway --version
else
    echo -e "${RED}❌ Flyway installation verification failed${NC}"
    exit 1
fi

# Clean up
echo -e "${YELLOW}🧹 Cleaning up temporary files...${NC}"
cd /
rm -rf "$TEMP_DIR"

echo -e "${GREEN}🎉 Flyway installation completed successfully!${NC}"
echo -e "${BLUE}Usage: flyway --help${NC}"
