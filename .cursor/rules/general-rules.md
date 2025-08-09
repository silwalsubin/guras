---
type: "always_apply"
---

# Guras Project Rules

## Project Structure & Context
- This is a React Native meditation/wellness app with TypeScript
- Project has `react-native/` folder containing the mobile app
- Server backend is in `server/` folder (C# .NET APIs)
- Infrastructure as Code in `iac/` folder (Terraform)

## Code Quality & Linting
- Only lint files in `react-native/src/` folder (not the entire react-native directory)
- Use TypeScript strict mode - fix all type errors
- Follow React Native and TypeScript best practices
- Prefer modern React patterns: hooks, contexts, functional components
- Use `// ... existing code ...` comments when editing files to show unchanged sections

## Styling & UI Preferences
- **ALWAYS** use colors from `react-native/src/config/colors.ts` - never hard-code colors
- Use `getThemeColors()` and `getBrandColors()` functions consistently
- Support both light and dark themes via Redux theme state
- Use React Native's built-in components and styling

## State Management
- Use Redux Toolkit with proper TypeScript types
- Store in `react-native/src/store/` with proper slices
- Use `useSelector` and `useDispatch` hooks consistently
- Keep state normalized and avoid deep nesting

## Platform-Specific Considerations
- Write cross-platform code when possible
- Use Platform.OS checks when platform-specific behavior is needed
- Avoid deprecated React Native APIs (like PushNotificationIOS)
- Use proper iOS Info.plist and Android AndroidManifest.xml configurations

## API & Services
- Services go in `react-native/src/services/` directory
- Use proper error handling with try/catch blocks
- Prefer Firebase services for backend integration
- Use TypeScript interfaces for API responses and data structures

## Dependencies & Imports
- Avoid adding unnecessary third-party dependencies
- When possible, use native React Native or Firebase alternatives
- Use absolute imports with `@/` prefix (configured in babel and tsconfig)
- Remove unused imports and dependencies promptly
- Use npm for package management (never yarn)

## Audio & Media
- Use react-native-track-player for audio functionality
- Configure proper audio capabilities in iOS Info.plist
- Handle audio interruptions and background playback properly

## Error Handling & Logging
- Use comprehensive error handling in async functions
- Provide fallback behavior when services fail
- Use descriptive console.log messages with emojis for better visibility
- Remove console.log messages after solving the issues.
- Handle permission requests gracefully with user-friendly messages

## Performance & Optimization
- Use React.memo and useCallback where appropriate
- Minimize re-renders with proper dependency arrays
- Use FlatList for large lists instead of ScrollView
- Implement proper loading states and error boundaries

## File Organization
- Components in `react-native/src/components/` (shared in `shared/`, app-specific in `app/`)
- Screens in `react-native/src/screens/` with nested component folders
- Use index.ts files for clean exports
- Keep related files close together (components with their styles)

## Testing & Debugging
- Write type-safe code to catch errors at compile time
- Use React Native debugger tools effectively
- Test on both iOS and Android when making platform-specific changes
- Use meaningful variable and function names for self-documenting code

## React Native Development Workflow
- Prefer running on the iOS Simulator over a physical device
- Run `npx @react-native-community/cli run-ios` in a new terminal in the foreground; do not run it as a background process

## Backend (.NET) Conventions
- Keep ASP.NET controllers thin and move business logic into corresponding services
- Use `ILogger<T>` for logging instead of `Console.WriteLine`

## AI Assistant Preferences
- Ask before making any code changes unless explicitly instructed by the user
- Use parallel tool calls when possible for efficiency
- Provide detailed explanations with step-by-step approaches
- Mark TODO items as completed immediately after finishing tasks
- Show code citations with proper line number format: ```startLine:endLine:filepath
- Always follow up on linter errors and fix them properly

## CI/CD & Deployment
- Use GitHub Actions for all deployment tasks; do not run deployment scripts locally

## Problem-Solving Approach
- **NEVER implement fallbacks before asking for permissions or solving the real problem**
- Always identify and fix the root cause first
- Ask for proper permissions before implementing workarounds
- Solve the real problem rather than masking it with fallbacks
- When debugging, show real errors instead of hiding them with fallback mechanisms