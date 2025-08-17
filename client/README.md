# Guras Audio Client

A Vue.js 3 frontend application for uploading and managing audio files with Firebase authentication and the Guras backend API.

## Features

- 🔐 **Firebase Authentication**: Google Sign-In integration
- 🎵 **Drag & Drop Upload**: Upload audio files and thumbnails with intuitive drag-and-drop interface
- ☁️ **Cloud Storage**: Files are stored securely in Amazon S3
- 🖼️ **Thumbnail Support**: Automatic pairing of audio files with their thumbnails
- 📊 **File Management**: View, download, and delete uploaded files
- 🔒 **Secure**: Uses Firebase ID tokens for API authentication
- 📱 **Responsive**: Works on desktop and mobile devices
- 🎨 **Modern UI**: Clean, modern interface with smooth animations

## Tech Stack

- **Vue.js 3** with Composition API
- **TypeScript** for type safety
- **Firebase** for authentication
- **Vite** for fast development and building
- **Vue Router** for navigation with auth guards
- **Pinia** for state management
- **Axios** for HTTP requests
- **Vue Toastification** for notifications

## Prerequisites

- Node.js 16+ 
- npm or yarn
- Running Guras backend API server
- Firebase project with Authentication enabled
- Google Sign-In configured in Firebase

## Firebase Setup

1. **Create a Firebase Project**:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or use existing one

2. **Enable Authentication**:
   - Go to Authentication > Sign-in method
   - Enable Google sign-in provider
   - Add your domain to authorized domains

3. **Get Firebase Configuration**:
   - Go to Project Settings > General
   - Scroll down to "Your apps" section
   - Click "Add app" and select Web
   - Copy the Firebase configuration object

4. **Configure Environment Variables**:
   - Copy `.env.local.example` to `.env.local`
   - Update with your Firebase configuration values

## Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your Firebase and API configuration
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Build for production**:
   ```bash
   npm run build
   ```

## Configuration

### Environment Variables

Required environment variables in `.env.local`:

```env
# API Configuration
VITE_API_BASE_URL=https://localhost:7001

# Firebase Configuration
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
VITE_FIREBASE_MEASUREMENT_ID=G-ABCDEF1234
```

### API Integration

The client communicates with the Guras backend API using Firebase ID tokens:

- `POST /api/audio/upload-url` - Get pre-signed upload URL
- `GET /api/audio/audio-files` - List all audio files
- `DELETE /api/audio/{fileName}` - Delete audio file
- `GET /api/audio/{fileName}/exists` - Check if file exists

All requests include `Authorization: Bearer <firebase-id-token>` header.

## Usage

### Authentication Flow

1. User clicks "Sign In" and is redirected to `/login`
2. User clicks "Continue with Google" 
3. Firebase handles Google OAuth flow
4. On success, user is redirected to `/upload`
5. Firebase ID token is automatically included in API requests

### Uploading Files

1. Sign in with Google account
2. Navigate to the Upload page
3. Drag and drop audio files (MP3, WAV, M4A, AAC, OGG, FLAC)
4. Optionally add thumbnail images (JPG, PNG)
5. Files with matching names will be automatically paired
6. Click "Upload Files" to start the upload process

### File Management

- View all uploaded files on the Upload page
- Download files using the download links
- Delete files with the delete button
- Files are automatically organized with metadata

## Project Structure

```
client/
├── src/
│   ├── components/          # Reusable Vue components
│   │   ├── FileUpload.vue   # Main file upload component
│   │   ├── LoginForm.vue    # Google sign-in form
│   │   └── AppNavigation.vue # Navigation with auth state
│   ├── views/               # Page components
│   │   ├── HomeView.vue     # Home page
│   │   ├── LoginView.vue    # Login page
│   │   ├── UploadView.vue   # Upload page (auth required)
│   │   └── AboutView.vue    # About page
│   ├── services/            # API and auth services
│   │   ├── api.ts           # API client with auth integration
│   │   └── auth.ts          # Firebase auth service
│   ├── stores/              # Pinia stores
│   │   └── auth.ts          # Authentication state management
│   ├── config/              # Configuration
│   │   └── firebase.ts      # Firebase configuration
│   └── router/              # Vue Router with auth guards
├── .env.local.example       # Environment variables template
└── dist/                    # Built application (after build)
```

## Authentication Guards

- **Public routes**: `/`, `/about`, `/login`
- **Protected routes**: `/upload` (requires authentication)
- **Guest routes**: `/login` (redirects to `/upload` if authenticated)

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run type-check` - Run TypeScript type checking
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Deployment

### Production Build

```bash
npm run build
```

### Environment Configuration

Update `.env.production` with your production values:

```env
VITE_API_BASE_URL=https://your-production-api.com
VITE_FIREBASE_API_KEY=your-production-api-key
# ... other Firebase config
```

## Troubleshooting

### Common Issues

1. **Firebase Auth Errors**: Check Firebase configuration and domain authorization
2. **CORS Errors**: Ensure the backend API has CORS configured for your domain
3. **API Connection**: Check that the backend server is running and accessible
4. **File Upload Fails**: Verify S3 permissions and Firebase token validation

## Security

- Firebase ID tokens are automatically refreshed
- Tokens are included in all API requests
- Backend validates Firebase tokens before processing requests
- Automatic sign-out on token expiration or API 401 responses

## License

This project is part of the Guras application suite.
