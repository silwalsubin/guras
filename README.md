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