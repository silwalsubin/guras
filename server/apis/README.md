# Firebase Authentication Setup

This ASP.NET Core API is configured to work with Firebase Authentication for your React Native iOS application.

## Setup Instructions

### 1. Firebase Project Setup

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select your existing project
3. Enable Authentication and configure your preferred sign-in methods (Email/Password, Google, etc.)

### 2. Download Service Account Key

1. In Firebase Console, go to Project Settings (gear icon)
2. Go to the "Service accounts" tab
3. Click "Generate new private key"
4. Download the JSON file and save it securely
5. Update the `ServiceAccountPath` in `appsettings.json` or set the `GOOGLE_APPLICATION_CREDENTIALS` environment variable

### 3. Configuration Options

#### Option A: Service Account File Path
Update `appsettings.json`:
```json
{
  "Firebase": {
    "ServiceAccountPath": "/path/to/your/serviceAccountKey.json"
  }
}
```

#### Option B: Environment Variable (Recommended for Production)
Set the environment variable:
```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your/serviceAccountKey.json"
```

### 4. React Native Integration

In your React Native app, after successful Firebase authentication, send the ID token to your server:

```javascript
import auth from '@react-native-firebase/auth';

// After user signs in
const user = auth().currentUser;
const idToken = await user.getIdToken();

// Send to your server
const response = await fetch('https://your-api.com/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    idToken: idToken
  })
});
```

### 5. Making Authenticated Requests

For protected endpoints, include the ID token in the Authorization header:

```javascript
const response = await fetch('https://your-api.com/api/helloworld/authenticated', {
  headers: {
    'Authorization': `Bearer ${idToken}`
  }
});
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Verify Firebase ID token and get user info
- `GET /api/auth/profile` - Get current user profile (requires authentication)
- `GET /api/auth/verify` - Verify if token is valid (requires authentication)

### Example Endpoints
- `GET /api/helloworld` - Public endpoint
- `GET /api/helloworld/authenticated` - Protected endpoint (requires authentication)

## Security Notes

1. **Never expose your service account key** in client-side code
2. **Use HTTPS** in production
3. **Validate tokens on every request** (this is handled automatically)
4. **Store tokens securely** in your React Native app
5. **Implement token refresh** logic in your app

## Development vs Production

- **Development**: Use service account file or default credentials
- **Production**: Use environment variables and secure configuration management
- **Testing**: You can use Firebase Auth Emulator for local development

## Troubleshooting

1. **Invalid token errors**: Ensure the Firebase project ID matches between client and server
2. **Service account issues**: Verify the service account has the necessary permissions
3. **CORS issues**: Configure CORS if your React Native app is running on a different domain
4. **Token expiration**: Implement token refresh logic in your React Native app 