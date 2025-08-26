# MusicPlayerContext Single Source of Truth Rule

## Overview
MusicPlayerContext must be the single source of truth for all music-related state and operations in the React Native application. No component should maintain local music state or use setTimeout hacks for music operations.

## Core Principles

### 1. Single Source of Truth
- **MusicPlayerContext** is the ONLY place where music state is managed
- All music-related state (playing status, current track, progress, etc.) must live in MusicPlayerContext
- Components should NEVER maintain local copies of music state
- Components should NEVER duplicate music state in local useState hooks

### 2. No setTimeout Hacks
- **NEVER** use `setTimeout` for music operations or state synchronization
- **NEVER** use polling or delays to wait for music player readiness
- Use proper async/await patterns and event listeners instead
- Use Promise-based waiting mechanisms with proper error handling
- **EXCEPTION**: `setInterval` is allowed ONLY for audio fading operations where gradual volume changes over time are required, as there's no alternative API for smooth audio transitions

### 3. State Management Rules
- Components should only consume state from MusicPlayerContext via `useMusicPlayer()` hook
- Components should only trigger actions through MusicPlayerContext methods
- No direct TrackPlayer API calls outside of MusicPlayerContext
- No local state that mirrors or duplicates music player state

### 4. Proper Async Handling
- All music operations must be properly awaited
- Use event listeners for state changes, not polling
- Implement proper loading states within the context
- Handle errors gracefully without setTimeout fallbacks

## Prohibited Patterns

### ❌ Local State Duplication
```typescript
// WRONG - Don't duplicate music state locally
const [isPlaying, setIsPlaying] = useState(false);
const [currentTrack, setCurrentTrack] = useState(null);
```

### ❌ setTimeout Hacks
```typescript
// WRONG - Don't use setTimeout for music operations
setTimeout(() => {
  playTrack(track);
}, 100);

// WRONG - Don't poll for readiness
while (!isSetup && attempts < maxAttempts) {
  await new Promise(resolve => setTimeout(resolve, 100));
  attempts++;
}

// EXCEPTION - setInterval is allowed ONLY for audio fading
const fadeInterval = setInterval(async () => {
  await TrackPlayer.setVolume(newVolume);
  // ... fade logic
}, stepDuration);
```

### ❌ Direct TrackPlayer Calls
```typescript
// WRONG - Don't call TrackPlayer directly in components
await TrackPlayer.play();
await TrackPlayer.pause();
```

## Required Patterns

### ✅ Use Context State Only
```typescript
// CORRECT - Use only context state
const { isPlaying, currentTrack, playTrack } = useMusicPlayer();
```

### ✅ Proper Async Operations
```typescript
// CORRECT - Proper async handling with error handling
const handlePlay = async () => {
  try {
    await playTrack(track);
  } catch (error) {
    console.error('Failed to play track:', error);
  }
};
```

### ✅ Event-Driven State Updates
```typescript
// CORRECT - Use event listeners, not polling
useEffect(() => {
  const listener = TrackPlayer.addEventListener(Event.PlaybackState, (data) => {
    setIsPlayingState(data.state === State.Playing);
  });
  return () => listener.remove();
}, []);
```

## Implementation Requirements

### MusicPlayerContext Must Provide:
1. **Complete State Management**: All music-related state
2. **Async Operation Handling**: Proper Promise-based operations
3. **Event-Driven Updates**: Real-time state synchronization
4. **Error Handling**: Graceful error recovery
5. **Loading States**: Proper loading indicators
6. **Setup Management**: Robust initialization without timeouts

### Components Must:
1. **Only consume** state from MusicPlayerContext
2. **Never maintain** local music state
3. **Never use** setTimeout for music operations
4. **Always await** music operations properly
5. **Handle errors** from context methods

## Enforcement
- Any component using `setTimeout` for music operations should be refactored
- Any component maintaining local music state should be refactored
- Any direct TrackPlayer API calls outside MusicPlayerContext should be moved to the context
- All music operations should go through MusicPlayerContext methods

## Benefits
- **Consistency**: Single source of truth prevents state synchronization issues
- **Reliability**: Proper async handling eliminates race conditions
- **Maintainability**: Centralized music logic is easier to debug and modify
- **Performance**: No unnecessary polling or timeouts
- **Predictability**: Clear data flow and state management
