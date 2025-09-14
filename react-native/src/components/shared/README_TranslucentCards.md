# Translucent Card Components

This document explains the difference between transparent and translucent cards, and how to use the new translucent card components.

## Overview

- **Transparent Cards**: Use rgba colors to create transparency. Background shows through but is not blurred.
- **Translucent Cards**: Use BlurView to create a translucent effect where the background is blurred for better readability.

## Components

### SemiTransparentCard (Updated)
- **Purpose**: Legacy component that provides transparency without blur
- **Effect**: Background shows through with rgba colors
- **Use Case**: When you want to see the background clearly without blur

### TranslucentCard (New)
- **Purpose**: Modern component that provides translucent effect with background blur
- **Effect**: Background is blurred, creating better readability while maintaining see-through aesthetic
- **Use Case**: When you want a modern glass-morphism effect with improved content readability

## Usage Examples

### Basic TranslucentCard
```tsx
import { TranslucentCard } from '@/components/shared';

<TranslucentCard>
  <Text>Your content here</Text>
</TranslucentCard>
```

### Custom Blur Amount
```tsx
<TranslucentCard blurAmount={30} intensity={0.7}>
  <Text>Custom blur effect</Text>
</TranslucentCard>
```

### Custom Styling
```tsx
<TranslucentCard 
  style={{ marginHorizontal: 20 }}
  contentStyle={{ padding: 24 }}
>
  <Text>Custom styled translucent card</Text>
</TranslucentCard>
```

## Props

### TranslucentCard Props
- `children`: React nodes to render inside the card
- `style`: Custom styles for the card container
- `contentStyle`: Custom styles for the content wrapper
- `blurAmount`: Blur intensity (iOS only, default: 20)
- `intensity`: Opacity for Android fallback (default: 0.8)

### SemiTransparentCard Props
- `children`: React nodes to render inside the card
- `style`: Custom styles for the card container
- `contentStyle`: Custom styles for the content wrapper

## Platform Differences

### iOS
- Uses native `BlurView` component for true background blur
- Supports custom `blurAmount` for different blur intensities
- Automatically adapts to light/dark themes

### Android
- Falls back to semi-transparent background with rgba colors
- Uses `intensity` prop to control opacity
- No native blur effect (limitation of React Native)

## Best Practices

1. **Use TranslucentCard** for modern UI designs and better readability
2. **Use SemiTransparentCard** when you need to see background details clearly
3. **Test on both platforms** to ensure consistent appearance
4. **Consider content contrast** - translucent cards work best with high-contrast text
5. **Use appropriate blur amounts** - 20-30 for standard use, 10-15 for subtle effects

## Demo

Use the `TranslucentCardDemo` component to see the difference between transparent and translucent cards:

```tsx
import { TranslucentCardDemo } from '@/components/shared';

<TranslucentCardDemo />
```

## Migration

To migrate from `SemiTransparentCard` to `TranslucentCard`:

```tsx
// Before
<SemiTransparentCard>
  <Text>Content</Text>
</SemiTransparentCard>

// After
<TranslucentCard>
  <Text>Content</Text>
</TranslucentCard>
```

The new component maintains the same API while providing better visual effects and readability.
