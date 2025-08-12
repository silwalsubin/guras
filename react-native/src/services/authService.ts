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
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
}

class AuthService {
  private async makeRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' = 'POST',
    body?: any
  ): Promise<T> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `HTTP error! status: ${response.status}`;
        console.error('Server error response:', { status: response.status, error: errorData });
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  async login(): Promise<LoginResponse> {
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        throw new Error('No authenticated user found');
      }

      const idToken = await currentUser.getIdToken();
      
      return await this.makeRequest<LoginResponse>('/api/auth/login', 'POST', {
        idToken,
      });
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Login failed');
    }
  }

  async signUp(email: string, name?: string): Promise<SignUpResponse> {
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        throw new Error('No authenticated user found');
      }

      const idToken = await currentUser.getIdToken();
      
      console.log('Calling server signup endpoint with:', { email, name, hasIdToken: !!idToken });
      
      const response = await this.makeRequest<SignUpResponse>('/api/auth/signup', 'POST', {
        idToken,
        email,
        name,
      });
      
      console.log('Server signup response:', response);
      return response;
    } catch (error) {
      console.error('Signup failed:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Sign up failed');
    }
  }

  async googleSignIn(): Promise<LoginResponse> {
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        throw new Error('No authenticated user found');
      }

      const idToken = await currentUser.getIdToken();
      const email = currentUser.email;
      const displayName = currentUser.displayName;
      
      console.log('Google Sign In - attempting to sync with server:', { email, displayName, hasIdToken: !!idToken });
      
      try {
        // First, try to login (user might already exist)
        const loginResponse = await this.makeRequest<LoginResponse>('/api/auth/login', 'POST', {
          idToken,
        });
        
        console.log('Google Sign In - user already exists, login successful');
        return loginResponse;
        
      } catch (loginError: any) {
        // If login fails, user probably doesn't exist, so create them
        if (loginError.message?.includes('User not found') || loginError.message?.includes('Invalid token')) {
          console.log('Google Sign In - user not found, creating new user via signup');
          
          const signupResponse = await this.makeRequest<SignUpResponse>('/api/auth/signup', 'POST', {
            idToken,
            email,
            name: displayName || email?.split('@')[0] || 'User',
          });
          
          console.log('Google Sign In - new user created successfully');
          
          // Convert SignUpResponse to LoginResponse format
          return {
            success: true,
            message: 'User created successfully',
            user: {
              id: signupResponse.uid,
              email: signupResponse.email || email || '',
              name: signupResponse.displayName || displayName || '',
            },
          };
        }
        
        // Re-throw other login errors
        throw loginError;
      }
    } catch (error) {
      console.error('Google Sign In failed:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Google sign in failed');
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
    // Firebase handles the sign out, no server call needed
    const auth = getAuth();
    await auth.signOut();
  }
}

export default new AuthService();
