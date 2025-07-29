# Firebase Cloud Messaging (FCM) Setup Guide

This guide walks you through setting up Firebase Cloud Messaging for remote push notifications in your Guras app.

## 🔥 Firebase Project Setup

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing project
3. Enable Google Analytics (optional)

### 2. Add iOS App
1. Click "Add app" → iOS
2. Enter your iOS bundle ID (from `ios/Guras/Info.plist`)
3. Download `GoogleService-Info.plist`
4. Place it in `react-native/ios/` directory
5. Add to Xcode project

### 3. Add Android App
1. Click "Add app" → Android
2. Enter your Android package name (from `android/app/src/main/AndroidManifest.xml`)
3. Download `google-services.json`
4. Place it in `react-native/android/app/` directory

## 🔧 Client-Side Configuration

### iOS Configuration
The iOS configuration is already set up in your project:

1. **Info.plist** - Background modes configured:
   ```xml
   <key>UIBackgroundModes</key>
   <array>
       <string>audio</string>
       <string>background-processing</string>
       <string>remote-notification</string>
   </array>
   ```

2. **Firebase SDK** - Already installed:
   ```json
   "@react-native-firebase/app": "^22.2.1",
   "@react-native-firebase/messaging": "^22.2.1"
   ```

### Android Configuration
Android permissions are already added to `AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
<uses-permission android:name="android.permission.VIBRATE" />
<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
<uses-permission android:name="android.permission.WAKE_LOCK" />
```

## 🖥️ Server-Side Configuration

### 1. Firebase Admin SDK Setup

#### For Local Development:
1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate new private key"
3. Download the JSON file
4. Set environment variable:
   ```bash
   export GOOGLE_APPLICATION_CREDENTIALS="path/to/service-account-key.json"
   ```

#### For Production (AWS):
1. Upload service account key to AWS Secrets Manager
2. Configure IAM role to access the secret
3. Update server deployment to use the secret

### 2. Server Dependencies
Firebase Admin SDK is already added to `server/apis/apis.csproj`:
```xml
<PackageReference Include="FirebaseAdmin" Version="2.4.0"/>
```

## 📱 How It Works

### Client-Side Flow:
1. **FCM Initialization**: App requests notification permissions and gets FCM token
2. **Token Registration**: Token is sent to your server and stored with user ID
3. **Message Handling**: App listens for incoming FCM messages
4. **Foreground Notifications**: Shows in-app alerts when app is active
5. **Background Notifications**: System handles notifications when app is closed

### Server-Side Flow:
1. **Token Storage**: Server stores FCM tokens for each user
2. **Scheduled Notifications**: Background service sends daily quote notifications
3. **Message Routing**: Firebase delivers messages to appropriate devices
4. **Delivery Tracking**: Server logs success/failure rates

## 🔑 API Endpoints

### Register FCM Token
```http
POST /api/notification/register-token
Content-Type: application/json

{
  "token": "fcm_token_here",
  "platform": "ios|android",
  "userId": "user_id_here"
}
```

### Send Individual Notification
```http
POST /api/notification/send
Content-Type: application/json

{
  "token": "fcm_token_here",
  "title": "Notification Title",
  "body": "Notification Body",
  "data": {
    "custom": "data"
  },
  "platform": "ios|android"
}
```

### Send Quote Notification to Multiple Users
```http
POST /api/notification/send-quote
Content-Type: application/json

{
  "userTokens": ["token1", "token2", "token3"],
  "quote": {
    "text": "Peace comes from within.",
    "author": "Buddha",
    "category": "inner-peace"
  }
}
```

## 🔄 Background Service

The `NotificationSchedulerService` runs continuously and:
- Checks every 5 minutes for users due for notifications
- Respects user preferences (frequency, quiet hours)
- Sends quote notifications via FCM
- Logs delivery statistics

## 🧪 Testing

### Test Individual Notification:
1. Open the app and grant notification permissions
2. Go to Profile → Daily Wisdom Settings
3. Tap "Test Quote Update"
4. Check server logs for FCM token registration
5. Server should send notification to your device

### Test Scheduled Notifications:
1. Check server logs for `NotificationSchedulerService` activity
2. Add your FCM token to the `GetActiveUserTokens()` method temporarily
3. Wait for the next 5-minute check cycle
4. Should receive automatic quote notification

## 🚨 Troubleshooting

### Client Issues:
- **No token received**: Check Firebase configuration files are in correct locations
- **Permission denied**: Ensure user grants notification permissions
- **Messages not received**: Check if app is in foreground/background handling

### Server Issues:
- **Firebase Admin SDK error**: Verify service account key and permissions
- **HTTP 400 errors**: Check request body format matches API expectations
- **Messages not sent**: Verify FCM tokens are valid and not expired

### Common Fixes:
- Clean and rebuild both iOS and Android projects
- Verify bundle ID and package name match Firebase project
- Check that Firebase services are enabled in console
- Ensure proper network connectivity for FCM delivery

## 📊 Monitoring

Monitor your FCM implementation through:
- Firebase Console → Cloud Messaging → Reports
- Server application logs
- Client-side FCM event logs
- User notification preferences and delivery rates

## 🔒 Security Considerations

- Store FCM tokens securely in database
- Validate notification requests server-side
- Implement rate limiting for notification sending
- Use HTTPS for all API communications
- Regularly rotate Firebase service account keys

## 🎯 Next Steps

1. **Database Integration**: Connect token registration to your user database
2. **User Preferences**: Link notification frequency to user settings
3. **Analytics**: Track notification open rates and user engagement
4. **A/B Testing**: Test different notification content and timing
5. **Rich Notifications**: Add images and action buttons to notifications 