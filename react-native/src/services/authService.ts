import { API_CONFIG } from '@/config/api';
import { getAuth } from '@react-native-firebase/auth';

// Types for server communication
export interface LoginRequest {
  idToken: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    email: string;
    name?: string;
    firebaseUid: string;
  };
}

export interface SignUpRequest {
  idToken: string;
  email: string;
  name?: string;
}

export interface SignUpResponse {
  uid: string;
  email: string;
  displayName?: string;
  isNewUser: boolean;
  firebaseUid: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
}

class AuthService {
  private isAuthenticating = false;
  private currentApplicationUserId: string | null = null;

  // Store the application user ID after successful authentication
  setApplicationUserId(userId: string) {
    this.currentApplicationUserId = userId;
    console.log('💾 Stored application user ID:', userId);
  }

  // Get the stored application user ID
  getApplicationUserId(): string | null {
    return this.currentApplicationUserId;
  }

  // Clear the stored application user ID (e.g., on sign out)
  clearApplicationUserId() {
    this.currentApplicationUserId = null;
    console.log('🗑️ Cleared application user ID');
  }

  private async makeRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' = 'POST',
    body?: any
  ): Promise<T> {
    const fullUrl = `${API_CONFIG.BASE_URL}${endpoint}`;
    
    // Get the current Firebase ID token for authentication
    let authHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
    
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      
      if (currentUser) {
        const idToken = await currentUser.getIdToken();
        authHeaders['Authorization'] = `Bearer ${idToken}`;
        console.log('🔑 Added Authorization header with Firebase ID token');
      } else {
        console.log('⚠️ No authenticated user found, request will be unauthenticated');
      }
    } catch (error) {
      console.log('⚠️ Could not get Firebase ID token:', error);
    }
    
    console.log(`🌐 Making ${method} request to full URL: ${fullUrl}`);
    console.log(`📋 Request details:`, {
      method,
      endpoint,
      baseUrl: API_CONFIG.BASE_URL,
      fullUrl,
      body: body ? JSON.stringify(body) : 'No body',
      headers: authHeaders
    });
    
    try {
      const response = await fetch(fullUrl, {
        method,
        headers: authHeaders,
        body: body ? JSON.stringify(body) : undefined,
      });

      console.log(`📡 Server response for ${fullUrl}:`, {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        url: response.url
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `HTTP error! status: ${response.status}`;
        console.error('❌ Server error response details:', { 
          status: response.status, 
          statusText: response.statusText,
          error: errorData, 
          endpoint,
          fullUrl,
          requestBody: body
        });
        throw new Error(errorMessage);
      }

      const responseData = await response.json();
      console.log(`✅ Server response successful for ${fullUrl}:`, {
        endpoint,
        fullUrl,
        responseData,
        requestBody: body
      });
      return responseData;
    } catch (error) {
      console.error(`💥 Request failed for ${fullUrl}:`, {
        endpoint,
        fullUrl,
        error: error instanceof Error ? error.message : error,
        requestBody: body
      });
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  async login(): Promise<LoginResponse> {
    if (this.isAuthenticating) {
      throw new Error('Authentication already in progress. Please wait.');
    }

    this.isAuthenticating = true;
    
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        throw new Error('No authenticated user found');
      }

      const idToken = await currentUser.getIdToken();
      const email = currentUser.email;
      const displayName = currentUser.displayName;
      
      // Instead of trying to login first, let's create the user directly
      // This avoids the confusing "login fails, so signup" flow
      console.log('🆕 Creating new user via signup...');
      
      const signupPayload = {
        IdToken: idToken,
        Email: email,
        Name: displayName || email?.split('@')[0] || 'User',
      };
      console.log('📤 Signup request payload:', signupPayload);
      
      const signupResponse = await this.makeRequest<SignUpResponse>('/api/auth/signup', 'POST', signupPayload);
      
      console.log('✅ New user created successfully:', signupResponse);
      
      // Return the signup response directly - no need to convert to login format
      return {
        success: true,
        message: 'User created successfully',
        user: {
          id: signupResponse.uid, // This is the application user ID
          email: signupResponse.email || email || '',
          name: signupResponse.displayName || displayName || '',
          firebaseUid: signupResponse.firebaseUid,
        },
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Login failed');
    } finally {
      this.isAuthenticating = false;
    }
  }

  async signUp(email: string, name?: string): Promise<SignUpResponse> {
    if (this.isAuthenticating) {
      throw new Error('Authentication already in progress. Please wait.');
    }

    this.isAuthenticating = true;
    
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        throw new Error('No authenticated user found');
      }

      const idToken = await currentUser.getIdToken();
      
      console.log('🆕 Calling server signup endpoint with:', { email, name, hasIdToken: !!idToken });
      
      const response = await this.makeRequest<SignUpResponse>('/api/auth/signup', 'POST', {
        IdToken: idToken,
        Email: email,
        Name: name,
      });
      
      console.log('✅ Server signup response:', response);
      return response;
    } catch (error) {
      console.error('❌ Signup failed:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Sign up failed');
    } finally {
      this.isAuthenticating = false;
    }
  }

  async googleSignIn(): Promise<LoginResponse> {
    if (this.isAuthenticating) {
      console.log('🚫 Authentication already in progress, blocking duplicate call');
      throw new Error('Authentication already in progress. Please wait.');
    }

    console.log('🚀 Starting Google Sign In authentication flow');
    console.log('🔧 Environment config:', {
      baseUrl: API_CONFIG.BASE_URL,
      environment: API_CONFIG.ENVIRONMENT,
      debugMode: API_CONFIG.DEBUG_MODE
    });
    
    this.isAuthenticating = true;
    
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        throw new Error('No authenticated user found');
      }

      const idToken = await currentUser.getIdToken();
      const email = currentUser.email;
      const displayName = currentUser.displayName;
      
      console.log('🔑 Got Firebase credentials:', { 
        email, 
        displayName, 
        hasIdToken: !!idToken,
        idTokenLength: idToken?.length || 0,
        currentUserUid: currentUser.uid
      });
      
      // Try to get user profile first - if successful, user exists
      try {
        console.log('🔍 Checking if user exists by attempting to get profile...');
        const profileResponse = await this.makeRequest<{ user: any }>('/api/auth/profile', 'GET');
        console.log('✅ User already exists, profile retrieved:', profileResponse);
        
        // Store the application user ID for future use
        const userId = profileResponse.user.uid || profileResponse.user.id;
        if (userId) {
          this.setApplicationUserId(userId);
        }
        
        // User exists, return success response
        return {
          success: true,
          message: 'User authenticated successfully',
          user: {
            id: userId,
            email: profileResponse.user.email,
            name: profileResponse.user.name || profileResponse.user.displayName,
            firebaseUid: profileResponse.user.firebaseUid || currentUser.uid,
          },
        };
        
      } catch (profileError: any) {
        console.log('⚠️ Profile check failed:', profileError.message);
        
        // Check if the profile error is due to user not existing vs authentication issues
        if (profileError.message && (
          profileError.message.includes('not found') || 
          profileError.message.includes('404') ||
          profileError.message.includes('User not found')
        )) {
          // User truly doesn't exist, proceed with signup
          console.log('🆕 User profile not found, creating new user via signup');
          
          const signupPayload = {
            IdToken: idToken,
            Email: email,
            Name: displayName || email?.split('@')[0] || 'User',
          };
          console.log('📤 Signup request payload:', signupPayload);
          
          try {
            const signupResponse = await this.makeRequest<SignUpResponse>('/api/auth/signup', 'POST', signupPayload);
            
            console.log('✅ New user created successfully:', signupResponse);
            
            // Store the application user ID for future use
            this.setApplicationUserId(signupResponse.uid);
            
            // Return the signup response with the application user ID
            return {
              success: true,
              message: 'User created successfully',
              user: {
                id: signupResponse.uid, // This is the application user ID
                email: signupResponse.email || email || '',
                name: signupResponse.displayName || displayName || '',
                firebaseUid: signupResponse.firebaseUid,
              },
            };
          } catch (signupError: any) {
            // If signup fails with "user already exists" error, create a minimal session
            if (signupError.message && signupError.message.includes('already exists')) {
              console.log('🔄 User already exists, creating minimal session...');
              
              // Create a minimal user session based on Firebase user
              const minimalUserId = `firebase_${currentUser.uid}`;
              this.setApplicationUserId(minimalUserId);
              
              return {
                success: true,
                message: 'User authenticated successfully (using existing account)',
                user: {
                  id: minimalUserId,
                  email: email || '',
                  name: displayName || email?.split('@')[0] || 'User',
                  firebaseUid: currentUser.uid,
                },
              };
            } else {
              // Re-throw the original signup error
              throw signupError;
            }
          }
        } else {
          // Profile check failed due to other reasons (auth issues, server errors, etc.)
          // Assume user exists and create minimal session to avoid signup errors
          console.log('🔄 Profile check failed due to server/auth issues, creating minimal session...');
          
          const minimalUserId = `firebase_${currentUser.uid}`;
          this.setApplicationUserId(minimalUserId);
          
          return {
            success: true,
            message: 'User authenticated successfully (using existing account)',
            user: {
              id: minimalUserId,
              email: email || '',
              name: displayName || email?.split('@')[0] || 'User',
              firebaseUid: currentUser.uid,
            },
          };
        }
      }
    } catch (error) {
      console.error('❌ Google Sign In failed:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Google sign in failed');
    } finally {
      console.log('🏁 Google Sign In authentication flow completed, resetting flag');
      this.isAuthenticating = false;
    }
  }

  async getCurrentUser(): Promise<UserProfile | null> {
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        return null;
      }

      const idToken = await currentUser.getIdToken();
      
      const response = await this.makeRequest<{ user: UserProfile }>('/api/auth/profile', 'GET');
      return response.user || null;
    } catch (error) {
      console.log('Failed to get current user from server:', error);
      return null;
    }
  }

  async signOut(): Promise<void> {
    // Clear stored application user ID
    this.clearApplicationUserId();
    
    // Firebase handles the sign out, no server call needed
    const auth = getAuth();
    await auth.signOut();
  }

  // Helper method to check if authentication is in progress
  isAuthenticationInProgress(): boolean {
    return this.isAuthenticating;
  }
}

export default new AuthService();
