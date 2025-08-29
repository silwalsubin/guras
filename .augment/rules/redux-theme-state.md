# Redux Theme State Access Rule

## Overview
Dark mode state must always be accessed directly from the Redux store and should never be passed around as props between components. This ensures consistency, performance, and maintainability across the React Native application.

## Core Principles

### 1. Direct Redux Access Only
- **Redux store** is the ONLY source for dark mode state
- All components must access theme state using `useSelector((state: RootState) => state.theme.isDarkMode)`
- Components should NEVER receive `isDarkMode` as a prop
- Components should NEVER maintain local copies of theme state

### 2. No Prop Drilling
- **NEVER** pass `isDarkMode` down through component hierarchies
- **NEVER** pass theme-related state as props between components
- Each component that needs theme information must access it directly from Redux
- Parent components should NOT pass theme state to children

### 3. Consistent State Source
- All theme-related decisions must use the same Redux state
- No mixing of `useColorScheme()` with Redux theme state
- No local theme state management outside of Redux
- Redux `state.theme.isDarkMode` is the single source of truth

### 4. Performance Benefits
- Components only re-render when theme actually changes
- No unnecessary prop updates through component trees
- Efficient state subscription at component level
- Reduced component coupling

## Prohibited Patterns

### ❌ Prop Drilling Theme State
```typescript
// WRONG - Don't pass isDarkMode as props
interface ComponentProps {
  isDarkMode: boolean; // ❌ Never do this
  // ... other props
}

const ParentComponent = () => {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  return <ChildComponent isDarkMode={isDarkMode} />; // ❌ Wrong
};
```

### ❌ Using useColorScheme Instead of Redux
```typescript
// WRONG - Don't use React Native's useColorScheme
import { useColorScheme } from 'react-native';

const Component = () => {
  const colorScheme = useColorScheme(); // ❌ Wrong
  const isDarkMode = colorScheme === 'dark'; // ❌ Wrong
};
```

### ❌ Local Theme State Management
```typescript
// WRONG - Don't maintain local theme state
const [isDarkMode, setIsDarkMode] = useState(false); // ❌ Wrong
const [themeMode, setThemeMode] = useState('light'); // ❌ Wrong
```

### ❌ Mixed Theme Sources
```typescript
// WRONG - Don't mix different theme sources
const systemTheme = useColorScheme(); // ❌ Wrong
const reduxTheme = useSelector((state: RootState) => state.theme.isDarkMode); // ✅ Right
const finalTheme = systemTheme || reduxTheme; // ❌ Wrong - inconsistent
```

## Required Patterns

### ✅ Direct Redux Access
```typescript
// CORRECT - Access theme directly from Redux in each component
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

const Component = () => {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  
  return (
    <View style={{
      backgroundColor: isDarkMode ? '#000' : '#fff'
    }}>
      {/* Component content */}
    </View>
  );
};
```

### ✅ Theme-Aware Styling
```typescript
// CORRECT - Use theme colors with Redux state
import { getThemeColors } from '@/config/colors';

const Component = () => {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const themeColors = getThemeColors(isDarkMode);
  
  return (
    <View style={{ backgroundColor: themeColors.background }}>
      {/* Component content */}
    </View>
  );
};
```

### ✅ Independent Component Theme Access
```typescript
// CORRECT - Each component accesses theme independently
const ParentComponent = () => {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  // Use isDarkMode for parent styling only
  
  return (
    <View>
      <ChildComponent /> {/* Child accesses theme independently */}
    </View>
  );
};

const ChildComponent = () => {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  // Child has its own theme access
  
  return <Text style={{ color: isDarkMode ? '#fff' : '#000' }}>Content</Text>;
};
```

## Implementation Requirements

### Components Must:
1. **Always use** `useSelector((state: RootState) => state.theme.isDarkMode)` for theme access
2. **Never accept** `isDarkMode` as a prop
3. **Never pass** `isDarkMode` to child components
4. **Never use** `useColorScheme()` for theme decisions
5. **Never maintain** local theme state

### Redux Store Must:
1. **Provide** `state.theme.isDarkMode` as the single source of truth
2. **Handle** theme changes through proper Redux actions
3. **Persist** theme preferences across app sessions
4. **Initialize** with appropriate default theme

## Benefits

### Consistency
- All components use the same theme source
- No conflicts between different theme detection methods
- Predictable theme behavior across the app

### Performance
- Components only re-render when theme actually changes
- No unnecessary prop updates through component trees
- Efficient Redux state subscription

### Maintainability
- Centralized theme logic in Redux store
- Easy to debug theme-related issues
- Clear separation of concerns

### Developer Experience
- No need to thread theme props through components
- Consistent API across all components
- Type-safe theme access with TypeScript

## Enforcement
- Any component receiving `isDarkMode` as a prop should be refactored
- Any use of `useColorScheme()` for theme decisions should be replaced with Redux access
- Any local theme state management should be removed
- All theme-related styling should use Redux theme state

## Examples of Compliant Components
- `SemiTransparentCard` - Uses direct Redux access
- `MeditationTimer` - Accesses theme independently
- `ProfileScreen` - Uses Redux theme state consistently
