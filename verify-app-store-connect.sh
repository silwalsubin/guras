#!/bin/bash

echo "🔍 App Store Connect Verification Script"
echo "========================================"

# Check if Xcode command line tools are available
if ! command -v xcrun &> /dev/null; then
    echo "❌ Xcode command line tools not found"
    echo "📋 Install Xcode and run: xcode-select --install"
    exit 1
fi

echo "✅ Xcode command line tools found"

# Check if altool is available
if ! xcrun altool --version &> /dev/null; then
    echo "❌ altool not found"
    exit 1
fi

echo "✅ altool found"

# Test Apple ID authentication
echo ""
echo "🔐 Testing Apple ID authentication..."
echo "📋 You'll need to enter your Apple ID and app-specific password"

read -p "Enter your Apple ID: " APPLE_ID
read -s -p "Enter your app-specific password: " APP_SPECIFIC_PASSWORD
echo ""

if xcrun altool --list-providers -u "$APPLE_ID" -p "$APP_SPECIFIC_PASSWORD" > /dev/null 2>&1; then
    echo "✅ Apple ID authentication successful"
else
    echo "❌ Apple ID authentication failed"
    echo "📋 Please check your credentials"
    exit 1
fi

# List available apps
echo ""
echo "📱 Listing apps in your App Store Connect account..."
APPS_OUTPUT=$(xcrun altool --list-apps -u "$APPLE_ID" -p "$APP_SPECIFIC_PASSWORD" 2>/dev/null)

if echo "$APPS_OUTPUT" | grep -q "com.cosmos.guras"; then
    echo "✅ App 'com.cosmos.guras' found in App Store Connect"
    echo ""
    echo "📋 App details:"
    echo "$APPS_OUTPUT" | grep -A 5 -B 5 "com.cosmos.guras"
else
    echo "❌ App 'com.cosmos.guras' NOT found in App Store Connect"
    echo ""
    echo "📋 Available apps:"
    echo "$APPS_OUTPUT"
    echo ""
    echo "📋 To fix this:"
    echo "1. Go to https://appstoreconnect.apple.com"
    echo "2. Click '+' to add a new app"
    echo "3. Select 'iOS App'"
    echo "4. Bundle ID: com.cosmos.guras"
    echo "5. App Name: Guras"
    echo "6. Click 'Create'"
fi

echo ""
echo "🎉 Verification complete!" 