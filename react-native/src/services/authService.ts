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
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
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
      
      return await this.makeRequest<SignUpResponse>('/api/auth/signup', 'POST', {
        idToken,
        email,
        name,
      });
    } catch (error) {
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
      
      return await this.makeRequest<LoginResponse>('/api/auth/login', 'POST', {
        idToken,
      });
    } catch (error) {
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
