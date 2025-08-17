# Mini Music Player Component

A compact, reusable music player component that shares state with your main music player and can be rendered anywhere in your app.

## Features

- 🎵 **Shared State**: Uses the same Redux store as your main music player
- 🎮 **Full Controls**: Play/pause, next, previous buttons
- 🖼️ **Album Artwork**: Optional artwork display
- 📱 **Responsive**: Adapts to different screen sizes
- 🎨 **Customizable**: Flexible styling options
- 🔄 **Auto-sync**: Automatically updates when music state changes

## Quick Start

### 1. Basic Usage

```tsx
import MiniMusicPlayer from '@/components/MiniMusicPlayer';

// Simple usage
<MiniMusicPlayer />

// With navigation callback
<MiniMusicPlayer 
  onPress={() => navigation.navigate('MusicPlayer')}
/>
```

### 2. Global Player (Already Added)

The mini player is already integrated into your main App.tsx and will appear above the bottom navigation when music is playing.

### 3. Custom Styling

```tsx
<MiniMusicPlayer 
  style={{
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    margin: 16,
  }}
  showArtwork={false}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onPress` | `() => void` | `undefined` | Callback when player area is tapped |
| `showArtwork` | `boolean` | `true` | Whether to show album artwork |
| `style` | `ViewStyle` | `undefined` | Custom styling for the container |

## Usage Examples

### In a Screen Header
```tsx
const MyScreen = () => (
  <View style={{ flex: 1 }}>
    <MiniMusicPlayer style={{ borderBottomWidth: 1 }} />
    <ScrollView>
      {/* Your content */}
    </ScrollView>
  </View>
);
```

### Compact Version
```tsx
<MiniMusicPlayer 
  showArtwork={false}
  style={{ paddingVertical: 8 }}
/>
```

### In a Card
```tsx
<View style={cardStyles}>
  <Text>Now Playing</Text>
  <MiniMusicPlayer style={{ backgroundColor: 'transparent' }} />
</View>
```

## State Management

The mini player automatically:
- ✅ Shows/hides based on whether music is loaded
- ✅ Updates track info when songs change
- ✅ Reflects play/pause state
- ✅ Syncs with main music player controls

## Styling

### Default Styles
- White background with shadow
- 16px horizontal padding, 12px vertical padding
- Border top with light gray color
- Flexbox layout with track info and controls

### Customization
You can override any styles using the `style` prop:

```tsx
<MiniMusicPlayer 
  style={{
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    borderRadius: 8,
    margin: 16,
  }}
/>
```

## Integration with Navigation

### Navigate to Full Player
```tsx
import { useNavigation } from '@react-navigation/native';
import { setActiveTab, TAB_KEYS } from '@/store/navigationSlice';
import { useDispatch } from 'react-redux';

const MyComponent = () => {
  const dispatch = useDispatch();
  
  const handleMiniPlayerPress = () => {
    dispatch(setActiveTab(TAB_KEYS.AUDIO));
  };

  return (
    <MiniMusicPlayer onPress={handleMiniPlayerPress} />
  );
};
```

## Components Structure

```
MiniMusicPlayer/
├── MiniMusicPlayer.tsx          # Main component
└── mini-music-controls/
    ├── MiniPlayPauseButton.tsx  # Play/pause control
    ├── MiniNextButton.tsx       # Next track control
    └── MiniPreviousButton.tsx   # Previous track control
```

## Troubleshooting

### Player Not Showing
- Ensure music is loaded in the main player first
- Check that `currentTrack` and `audioFiles` exist in Redux state

### Controls Not Working
- Verify TrackPlayer is properly initialized
- Check that MusicPlayerProvider wraps your app

### Styling Issues
- Use `style` prop to override default styles
- Check for conflicting absolute positioning

## Advanced Usage

See `MiniMusicPlayerExamples.tsx` for more detailed examples including:
- Different positioning strategies
- Custom themes
- Integration patterns
- Screen-specific implementations
