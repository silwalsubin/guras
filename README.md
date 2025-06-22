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

### Build Pipeline
- **Trigger**: Push to `master` branch or pull requests
- **Action**: Builds the iOS app and runs tests
- **Artifacts**: Build artifacts are uploaded for 7 days

### Deployment Pipeline
- **Trigger**: Push a tag starting with `v` (e.g., `v1.0.0`)
- **Action**: Builds, archives, and uploads to App Store Connect
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
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

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