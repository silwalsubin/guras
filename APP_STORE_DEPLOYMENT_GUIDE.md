# App Store Deployment Guide

This guide explains how to set up your GitHub Actions workflow to deploy your iOS app to the App Store.

## Overview

The workflow now includes a complete App Store deployment pipeline that:

1. ✅ **Builds** your React Native app
2. ✅ **Deploys to TestFlight** for testing
3. ✅ **Deploys to App Store Connect** for review and release

## Required GitHub Secrets

You need to configure the following secrets in your GitHub repository:

### 1. Apple Developer Certificate (`APPLE_DEVELOPER_CERTIFICATE`)
- **Type**: Distribution certificate (.p12 file)
- **How to get it**:
  1. Open **Keychain Access** on your Mac
  2. Find your **Apple Distribution** certificate
  3. Right-click → **Export**
  4. Choose **Personal Information Exchange (.p12)**
  5. Set a password (remember this for the next secret)
  6. Convert to base64: `base64 -i certificate.p12 | pbcopy`

### 2. Certificate Password (`APPLE_DEVELOPER_CERTIFICATE_PASSWORD`)
- **Type**: The password you set when exporting the .p12 file
- **Value**: The password string (not base64 encoded)

### 3. App Store Provisioning Profile (`APPLE_PROVISIONING_PROFILE`)
- **Type**: App Store distribution profile (.mobileprovision file)
- **How to get it**:
  1. Go to [Apple Developer Portal](https://developer.apple.com/account/resources/profiles/list)
  2. Create a new **App Store** provisioning profile for your app
  3. Download the .mobileprovision file
  4. Convert to base64: `base64 -i profile.mobileprovision | pbcopy`

### 4. Apple ID (`APPLE_ID`)
- **Type**: Your Apple Developer account email
- **Value**: The email address you use for App Store Connect

### 5. App-Specific Password (`APPLE_APP_SPECIFIC_PASSWORD`)
- **Type**: App-specific password (not your regular Apple ID password)
- **How to get it**:
  1. Go to [Apple ID Security](https://appleid.apple.com/account/manage)
  2. Sign in with your Apple ID
  3. Go to **App-Specific Passwords**
  4. Click **Generate Password**
  5. Give it a name like "GitHub Actions"
  6. Copy the generated password

### 6. Team ID (`APPLE_TEAM_ID`)
- **Type**: Your Apple Developer Team ID
- **How to get it**:
  1. Go to [Apple Developer Portal](https://developer.apple.com/account)
  2. Click on **Membership** in the left sidebar
  3. Copy the **Team ID** (10-character string)

## Setting Up GitHub Secrets

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret with the exact names shown above

## Workflow Steps

### 1. Build Phase
- Builds your React Native app
- Creates an iOS archive
- Uploads artifacts for later use

### 2. TestFlight Deployment
- Exports IPA for TestFlight
- Uploads to TestFlight for testing
- **Prerequisite**: App must exist in App Store Connect

### 3. App Store Deployment
- **Only runs after TestFlight succeeds**
- Sets up code signing with your certificates
- Exports IPA for App Store
- Uploads to App Store Connect for review

## App Store Connect Setup

Before deploying, ensure your app is properly configured in App Store Connect:

### 1. Create the App
1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Click **+** → **New App**
3. Fill in:
   - **Platform**: iOS
   - **Name**: Guras
   - **Bundle ID**: `com.cosmos.guras`
   - **SKU**: `guras-ios`
   - **Primary Language**: English (or your preferred language)

### 2. Configure App Information
1. **App Information**: Add description, keywords, etc.
2. **Pricing**: Set your app's price
3. **Availability**: Choose territories
4. **App Review Information**: Add contact details

### 3. Upload Screenshots
- Add screenshots for different device sizes
- Create app preview videos (optional)

### 4. Submit for Review
After the workflow uploads your build:
1. Go to **TestFlight** tab
2. Select your uploaded build
3. Click **Submit for Review**
4. Fill in the review questionnaire
5. Submit

## Troubleshooting

### Common Issues

#### 1. Certificate Issues
```
❌ No distribution certificate found
```
**Solution**: Ensure you're using an **Apple Distribution** certificate, not a Development certificate.

#### 2. Provisioning Profile Issues
```
❌ Provisioning profile file is empty or missing
```
**Solution**: Verify your provisioning profile is for **App Store** distribution and matches your bundle ID.

#### 3. App Not Found in App Store Connect
```
❌ App 'com.cosmos.guras' not found in App Store Connect
```
**Solution**: Create the app in App Store Connect first with the exact bundle ID.

#### 4. Authentication Issues
```
❌ Apple ID authentication failed
```
**Solution**: 
- Verify your Apple ID is correct
- Ensure you're using an app-specific password, not your regular password
- Check that your app-specific password hasn't expired

### Debug Information

The workflow provides extensive debug output:
- Certificate detection
- Provisioning profile details
- Bundle identifier verification
- Upload progress

## Security Best Practices

1. **Never commit certificates or profiles** to your repository
2. **Use app-specific passwords** instead of your main Apple ID password
3. **Rotate certificates regularly** (they expire annually)
4. **Limit access** to GitHub secrets to only necessary team members

## Next Steps

After successful deployment:

1. **TestFlight Testing**: Invite testers to TestFlight
2. **App Store Review**: Submit for App Store review
3. **Release**: Once approved, release to the App Store

## Support

If you encounter issues:
1. Check the workflow logs for detailed error messages
2. Verify all secrets are correctly configured
3. Ensure your app exists in App Store Connect
4. Check that your certificates and profiles are valid and not expired 