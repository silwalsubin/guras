#!/bin/bash

echo "🎨 Creating app icons for Guras..."

# Create the app icon directory if it doesn't exist
ICON_DIR="react-native/ios/Guras/Images.xcassets/AppIcon.appiconset"
mkdir -p "$ICON_DIR"

# Check if ImageMagick is available
if ! command -v convert &> /dev/null; then
    echo "❌ ImageMagick not found. Installing..."
    if command -v brew &> /dev/null; then
        brew install imagemagick
    else
        echo "❌ Homebrew not found. Please install ImageMagick manually:"
        echo "   brew install imagemagick"
        exit 1
    fi
fi

# Create a simple placeholder icon (blue background with "G" text)
echo "📱 Generating placeholder app icon..."

# Create a 1024x1024 base icon
convert -size 1024x1024 xc:#007AFF -gravity center -pointsize 400 -fill white -annotate 0 "G" temp_1024.png

# Generate all required sizes
echo "🔄 Generating different icon sizes..."

# iPhone icons
convert temp_1024.png -resize 40x40 "$ICON_DIR/Icon-App-20x20@2x.png"
convert temp_1024.png -resize 60x60 "$ICON_DIR/Icon-App-20x20@3x.png"
convert temp_1024.png -resize 58x58 "$ICON_DIR/Icon-App-29x29@2x.png"
convert temp_1024.png -resize 87x87 "$ICON_DIR/Icon-App-29x29@3x.png"
convert temp_1024.png -resize 80x80 "$ICON_DIR/Icon-App-40x40@2x.png"
convert temp_1024.png -resize 120x120 "$ICON_DIR/Icon-App-40x40@3x.png"
convert temp_1024.png -resize 120x120 "$ICON_DIR/Icon-App-60x60@2x.png"
convert temp_1024.png -resize 180x180 "$ICON_DIR/Icon-App-60x60@3x.png"

# App Store icon
cp temp_1024.png "$ICON_DIR/Icon-App-1024x1024@1x.png"

# Clean up temporary file
rm temp_1024.png

# Update the Contents.json to include the filenames
cat > "$ICON_DIR/Contents.json" << 'EOF'
{
  "images" : [
    {
      "filename" : "Icon-App-20x20@2x.png",
      "idiom" : "iphone",
      "scale" : "2x",
      "size" : "20x20"
    },
    {
      "filename" : "Icon-App-20x20@3x.png",
      "idiom" : "iphone",
      "scale" : "3x",
      "size" : "20x20"
    },
    {
      "filename" : "Icon-App-29x29@2x.png",
      "idiom" : "iphone",
      "scale" : "2x",
      "size" : "29x29"
    },
    {
      "filename" : "Icon-App-29x29@3x.png",
      "idiom" : "iphone",
      "scale" : "3x",
      "size" : "29x29"
    },
    {
      "filename" : "Icon-App-40x40@2x.png",
      "idiom" : "iphone",
      "scale" : "2x",
      "size" : "40x40"
    },
    {
      "filename" : "Icon-App-40x40@3x.png",
      "idiom" : "iphone",
      "scale" : "3x",
      "size" : "40x40"
    },
    {
      "filename" : "Icon-App-60x60@2x.png",
      "idiom" : "iphone",
      "scale" : "2x",
      "size" : "60x60"
    },
    {
      "filename" : "Icon-App-60x60@3x.png",
      "idiom" : "iphone",
      "scale" : "3x",
      "size" : "60x60"
    },
    {
      "filename" : "Icon-App-1024x1024@1x.png",
      "idiom" : "ios-marketing",
      "scale" : "1x",
      "size" : "1024x1024"
    }
  ],
  "info" : {
    "author" : "xcode",
    "version" : 1
  }
}
EOF

echo "✅ App icons created successfully!"
echo "📱 Icon files generated:"
ls -la "$ICON_DIR"/*.png
echo ""
echo "🎨 You can replace these placeholder icons with your actual app icon later."
echo "📋 The icons are located in: $ICON_DIR" 