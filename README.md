# Guras - Multi-Project Repository

This repository contains both Infrastructure as Code (IaC) and React Native mobile application projects.

## 📁 Repository Structure

```
guras/
├── iac/                    # Infrastructure as Code
│   └── (IaC files coming soon)
├── react-native/           # React Native Cross-Platform Application
│   ├── App.tsx            # Main application component
│   ├── ios/               # iOS-specific code
│   ├── android/           # Android-specific code
│   ├── package.json       # Dependencies
│   └── ...                # Other React Native files
├── .gitignore             # Git ignore rules
└── README.md              # This file
```

## 🚀 React Native App

A React Native cross-platform mobile application built with TypeScript.

### Features

- React Native 0.80.0
- TypeScript support
- iOS and Android development ready
- Metro bundler for fast development
- Hot reloading enabled
- **CI/CD with GitHub Actions** for automated builds and App Store deployment

### Prerequisites

Before running the React Native project, make sure you have the following installed:

- **Node.js** (v18.18 or higher)
- **Ruby** (v3.1.0 or higher)
- **Xcode** (latest version)
- **CocoaPods**
- **React Native CLI**

### Installation & Running

1. **Navigate to the React Native directory**
   ```bash
   cd react-native
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install iOS dependencies**
   ```bash
   cd ios
   pod install
   cd ..
   ```

4. **Run on iOS Simulator**
   ```bash
   npx react-native run-ios
   ```

   Or specify a specific simulator:
   ```bash
   npx react-native run-ios --simulator="iPhone 15 Pro"
   ```

5. **Open in Xcode** (Alternative)
   ```bash
   open ios/Guras.xcworkspace
   ```

### Development

- **Hot Reloading**: Changes to your code will automatically reload in the simulator
- **Developer Menu**: Shake the device or press `Cmd+D` in the simulator
- **Debugging**: Use React Native Debugger or Chrome DevTools

## 🔄 CI/CD Pipeline

This project includes automated CI/CD pipelines using GitHub Actions:

### Build & Version Pipeline
- **Trigger**: Push to `master` branch, pull requests, or manual dispatch
- **Action**: 
  - Builds the iOS app and validates project structure
  - Generates unique semantic versions (1.0.BUILD_NUMBER)
  - Creates git tags and updates app.json version
  - Uploads build artifacts with version information
- **Artifacts**: Build artifacts are uploaded for 7 days with version-specific naming

### Manual Deployment Pipeline
- **Trigger**: Manual workflow dispatch
- **Features**: 
  - Dropdown to select from available version tags
  - Choice between TestFlight and App Store deployment
  - Full build and archive process
- **Requirements**: App Store Connect API credentials

### Setup for App Store Deployment

1. **Create App Store Connect API Key**:
   - Go to [App Store Connect](https://appstoreconnect.apple.com)
   - Navigate to Users and Access → Keys
   - Create a new API key with App Manager role

2. **Add GitHub Secrets**:
   - Go to your GitHub repository → Settings → Secrets and variables → Actions
   - Add the following secrets:
     - `APP_STORE_CONNECT_API_KEY`: Your API key file content
     - `APP_STORE_CONNECT_API_KEY_ID`: Your API key ID
     - `APP_STORE_CONNECT_ISSUER_ID`: Your issuer ID

3. **Update Team ID**:
   - Edit `react-native/ios/exportOptions.plist`
   - Replace `YOUR_TEAM_ID` with your actual Apple Developer Team ID

4. **Deploy**:
   - **Automatic**: Every successful build creates a new version tag
   - **Manual**: Go to Actions → iOS Deploy to App Store → Run workflow
   - Select version tag from dropdown
   - Choose deployment environment (TestFlight or App Store)

### Version Format
- **Format**: `1.0.BUILD_NUMBER` (e.g., `1.0.1`, `1.0.2`, `1.0.15`)
- **Auto-generated**: Based on incrementing build number
- **Unique**: Each build gets a unique, sequential number
- **Tagged**: Each version is automatically tagged in git
- **Tracked**: Version is updated in `app.json` during build process

## 🏗️ Infrastructure as Code (IaC)

*Infrastructure as Code files will be added to the `iac/` directory.*

This section will contain:
- Cloud infrastructure definitions
- Deployment configurations
- Environment management
- CI/CD pipelines

## 📚 Available Scripts

### React Native (from react-native/ directory)
- `npm start` - Start the Metro bundler
- `npm run ios` - Run the app on iOS simulator
- `npm run android` - Run the app on Android (when set up)
- `npm test` - Run tests
- `npm run lint` - Run ESLint

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- React Native team for the amazing framework
- The React Native community for excellent documentation and support

---

**Note**: This repository contains multiple projects. Make sure to navigate to the correct directory when working on specific components.

# Guras

A React Native iOS app with automated CI/CD pipeline.

## CI/CD Pipeline

The project includes a comprehensive CI/CD pipeline for iOS builds and deployments:

### Workflow Structure

- **Build Job**: Compiles the app, creates archive, and uploads artifacts
- **TestFlight Job**: Automatically deploys to TestFlight after successful build
- **App Store Job**: Deploys to App Store with manual approval (requires environment setup)

### TestFlight Deployment Setup

To enable TestFlight deployment, you need to configure the following GitHub secrets:

#### Required Secrets

1. **App Store Connect API Credentials:**
   - `APP_STORE_CONNECT_API_KEY`: Base64-encoded App Store Connect API key (.p8 file)
   - `APP_STORE_CONNECT_API_KEY_ID`: Your API key ID
   - `APP_STORE_CONNECT_ISSUER_ID`: Your issuer ID

2. **Apple Developer Account:**
   - `APPLE_ID`: Your Apple ID email
   - `APPLE_APP_SPECIFIC_PASSWORD`: App-specific password for your Apple ID
   - `APPLE_TEAM_ID`: Your Apple Developer Team ID
   - `APPLE_BUNDLE_ID`: Your app's bundle identifier (e.g., com.yourcompany.guras)

3. **Code Signing:**
   - `APPLE_DEVELOPER_CERTIFICATE`: Base64-encoded distribution certificate (.p12 file)
   - `APPLE_DEVELOPER_CERTIFICATE_PASSWORD`: Password for the certificate
   - `APPLE_PROVISIONING_PROFILE`: Base64-encoded App Store provisioning profile
   - `APPLE_PROVISIONING_PROFILE_NAME`: Name of the provisioning profile

#### Setup Instructions

1. **Create App Store Connect API Key:**
   - Go to [App Store Connect](https://appstoreconnect.apple.com)
   - Navigate to Users and Access → Keys
   - Create a new API key with App Manager role
   - Download the .p8 file and encode it: `base64 -i AuthKey_XXXXXXXXXX.p8`

2. **Get Distribution Certificate:**
   - Export your distribution certificate from Keychain Access
   - Encode it: `base64 -i certificate.p12`

3. **Get Provisioning Profile:**
   - Download your App Store provisioning profile from Apple Developer
   - Encode it: `base64 -i profile.mobileprovision`

4. **Add Secrets to GitHub:**
   - Go to your repository Settings → Secrets and variables → Actions
   - Add each secret with the corresponding value

### App Store Deployment

App Store deployment requires additional setup:

1. **Create Production Environment:**
   - Go to repository Settings → Environments
   - Create a new environment named `production`
   - Enable "Required reviewers" and add yourself/team
   - Optionally add deployment branch restrictions

2. **Manual Approval:**
   - App Store deployments require manual approval
   - You'll see a "Review deployments" button in the Actions tab
   - Only designated reviewers can approve the deployment

### Workflow Triggers

- **Push to master**: Automatic build and TestFlight deployment
- **Pull Request**: Build only (no deployment)
- **Manual trigger**: Build and TestFlight deployment

## Project Structure

```
guras/
├── react-native/          # React Native iOS app
│   ├── ios/              # iOS project files
│   ├── App.tsx           # Main app component
│   └── package.json      # Dependencies
├── iac/                  # Infrastructure as Code
└── .github/workflows/    # CI/CD workflows
    └── ios-ci-cd.yml     # Main iOS build and deploy workflow
```

## iOS Deployment

This project includes automated iOS deployment to both TestFlight and App Store using GitHub Actions.

### Deployment Options

#### Automatic TestFlight Deployment
- **Trigger**: Push to `master` branch or pull requests
- **Destination**: TestFlight only
- **Build**: Uses timestamp-based versioning to ensure uniqueness

#### Manual App Store Deployment
- **Trigger**: Manual workflow dispatch
- **Destination**: App Store (production)
- **How to use**:
  1. Go to the "Actions" tab in GitHub
  2. Select "iOS Build & Deploy" workflow
  3. Click "Run workflow"
  4. Check the "Deploy to App Store" checkbox
  5. Click "Run workflow"

### Workflow Features

- **Same Build**: Both TestFlight and App Store use the same build artifacts
- **Unique Versions**: Timestamp-based versioning prevents conflicts
- **Code Signing**: Automated certificate and provisioning profile setup
- **Validation**: Comprehensive error checking and validation

### Prerequisites

Ensure the following GitHub secrets are configured:
- `APPLE_DEVELOPER_CERTIFICATE`: Base64-encoded distribution certificate
- `APPLE_DEVELOPER_CERTIFICATE_PASSWORD`: Certificate password
- `APPLE_PROVISIONING_PROFILE`: Base64-encoded App Store provisioning profile
- `APPLE_TEAM_ID`: Apple Developer Team ID
- `APPLE_BUNDLE_ID`: App bundle identifier
- `APPLE_PROVISIONING_PROFILE_NAME`: Provisioning profile name
- `APPLE_ID`: Apple ID for App Store Connect
- `APPLE_APP_SPECIFIC_PASSWORD`: App-specific password

### Version Format

Versions follow the format: `1.0.{timestamp}` where timestamp is a Unix timestamp, ensuring each build has a unique, incrementing version number. 

# Guras Project Cursor Rules

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

## Development Workflow
- **ALWAYS** pull latest changes from remote master branch before committing/pushing
- Resolve merge conflicts before proceeding with commits
- Use GitHub Actions for all deployment tasks (never run deployment scripts locally)
- For React Native, prefer iOS simulator over physical device for testing
- **ONLY use npm commands, never use yarn**
- **NEVER run iOS as background, always open a new terminal**

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
- **For features that cannot be tested locally (notifications, push notifications, device-specific functionality):**
  - **Use Alert.alert() instead of console.log() for debugging**
  - **Show step-by-step progress and error details in UI alerts**
  - **This ensures debugging information is visible in TestFlight and production builds**

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

## Git & Version Control
- Make atomic commits with clear, descriptive messages
- Keep commits focused on single features or fixes
- Use pull requests for code reviews when working in teams
- Never commit sensitive data or API keys

## AI Assistant Preferences
- Use parallel tool calls when possible for efficiency
- Provide detailed explanations with step-by-step approaches
- Mark TODO items as completed immediately after finishing tasks
- Show code citations with proper line number format: ```startLine:endLine:filepath
- Always follow up on linter errors and fix them properly

## Problem-Solving Approach
- **NEVER implement fallbacks before asking for permissions or solving the real problem**
- Always identify and fix the root cause first
- Ask for proper permissions before implementing workarounds
- Solve the real problem rather than masking it with fallbacks
- When debugging, show real errors instead of hiding them with fallback mechanisms 