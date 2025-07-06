# Environment Configuration Guide

This guide explains how to set up different environments (development, staging, production) for your React Native app with different API URLs.

## 🌍 Environment Overview

The app automatically detects the environment and uses the appropriate API URL:

- **Development**: `http://localhost:5053` (when running in debug mode)
- **Staging**: `https://staging-api.yourdomain.com` (when `REACT_NATIVE_ENV=staging`)
- **Production**: `https://api.yourdomain.com` (for release builds)

## 🚀 How It Works

### Automatic Detection

The environment is detected using the `__DEV__` flag in React Native:

```typescript
// In development (debug builds)
if (__DEV__) {
  // Uses development configuration
  API_BASE_URL: 'http://localhost:5053'
}

// In production (release builds)
else {
  // Uses production configuration
  API_BASE_URL: 'https://api.yourdomain.com'
}
```

### Manual Environment Override

You can override the environment using environment variables:

```bash
# Development
REACT_NATIVE_ENV=development npm run ios

# Staging
REACT_NATIVE_ENV=staging npm run ios

# Production
REACT_NATIVE_ENV=production npm run ios
```

## 📱 Available Scripts

### iOS
```bash
npm run ios:dev      # Development environment
npm run ios:staging  # Staging environment  
npm run ios:prod     # Production environment
```

### Android
```bash
npm run android:dev      # Development environment
npm run android:staging  # Staging environment
npm run android:prod     # Production environment
```

## ⚙️ Configuration Files

### `src/config/environments.ts`
Contains all environment-specific configurations:

```typescript
const ENVIRONMENTS = {
  development: {
    API_BASE_URL: 'http://localhost:5053',
    DEBUG_MODE: true,
    LOG_LEVEL: 'debug',
  },
  staging: {
    API_BASE_URL: 'https://staging-api.yourdomain.com',
    DEBUG_MODE: true,
    LOG_LEVEL: 'info',
  },
  production: {
    API_BASE_URL: 'https://api.yourdomain.com',
    DEBUG_MODE: false,
    LOG_LEVEL: 'warn',
  },
};
```

### `src/config/api.ts`
Uses the environment configuration:

```typescript
export const API_CONFIG = {
  BASE_URL: ENV_CONFIG.API_BASE_URL, // Automatically uses correct URL
  // ... other config
};
```

## 🔧 Customization

### 1. Update API URLs

Edit `src/config/environments.ts` and update the URLs:

```typescript
development: {
  API_BASE_URL: 'http://your-local-api:port',
  // ...
},
staging: {
  API_BASE_URL: 'https://your-staging-api.com',
  // ...
},
production: {
  API_BASE_URL: 'https://your-production-api.com',
  // ...
},
```

### 2. Add More Environment Variables

You can add more environment-specific variables:

```typescript
interface EnvironmentConfig {
  API_BASE_URL: string;
  ENVIRONMENT: 'development' | 'staging' | 'production';
  DEBUG_MODE: boolean;
  LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error';
  // Add more variables here
  FEATURE_FLAGS: {
    enableNewUI: boolean;
    enableAnalytics: boolean;
  };
}
```

### 3. Environment-Specific Features

Use the helper functions to conditionally enable features:

```typescript
import { isDevelopment, isProduction } from '../config/environments';

if (isDevelopment()) {
  // Enable debug features
  console.log('Debug mode enabled');
}

if (isProduction()) {
  // Enable production features
  analytics.enable();
}
```

## 🏗️ Build Process Integration

### For CI/CD Pipelines

You can set environment variables in your build process:

```yaml
# Example GitHub Actions
- name: Build iOS Staging
  env:
    REACT_NATIVE_ENV: staging
  run: |
    npm run ios:staging
```

### For Xcode/Android Studio

You can also set environment variables in your IDE build configurations.

## 🐛 Debugging

The app logs environment information in development mode:

```
🌍 Environment: development
🔗 API URL: http://localhost:5053
🐛 Debug Mode: true
📝 Log Level: debug
```

## 📋 Checklist

- [ ] Update API URLs in `src/config/environments.ts`
- [ ] Test development environment: `npm run ios:dev`
- [ ] Test staging environment: `npm run ios:staging`
- [ ] Test production environment: `npm run ios:prod`
- [ ] Verify API calls go to correct endpoints
- [ ] Update CI/CD pipeline if needed

## 🔒 Security Notes

- Never commit sensitive production URLs to version control
- Use environment variables for production deployments
- Consider using a secrets management system for production credentials 