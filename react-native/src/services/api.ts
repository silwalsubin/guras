import { getAuth } from '@react-native-firebase/auth';
import { UserProfile } from '../types/user';
import { API_CONFIG } from '../config/api';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

class ApiService {
  private async getAuthToken(): Promise<string | null> {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdToken();
        return token;
      }
      return null;
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const token = await this.getAuthToken();
      if (!token) {
        return { error: 'No authentication token available' };
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        return { error: `HTTP ${response.status}: ${errorText}` };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('API request failed:', error);
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async getProfile(): Promise<ApiResponse<UserProfile>> {
    return this.makeRequest<UserProfile>(API_CONFIG.ENDPOINTS.PROFILE);
  }
}

export const apiService = new ApiService(); 