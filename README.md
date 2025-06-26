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