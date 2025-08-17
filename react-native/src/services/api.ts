import { getAuth } from '@react-native-firebase/auth';
import { UserProfile } from '@/types/user';
import { API_CONFIG } from '@/config/api';

// Audio file types
export interface AudioFile {
  id: string;
  name: string;
  author: string;
  description?: string;
  durationSeconds?: number;
  fileSizeBytes?: number;
  audioDownloadUrl: string;
  thumbnailDownloadUrl?: string;
  uploadedByUserId: string;
  createdAt: string;
  updatedAt: string;
}

export interface AudioFilesResponse {
  files: AudioFile[];
  totalCount: number;
  expirationMinutes: number;
}

export interface UploadUrlResponse {
  uploadUrl: string;
  fileName: string;
  expiresAt: string;
}

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

  // Audio file management methods
  async getAudioFiles(expirationMinutes: number = 60): Promise<ApiResponse<AudioFilesResponse>> {
    return this.makeRequest<AudioFilesResponse>(
      `/api/audio/audio-files?expirationMinutes=${expirationMinutes}`
    );
  }

  async getMyAudioFiles(expirationMinutes: number = 60): Promise<ApiResponse<AudioFilesResponse>> {
    return this.makeRequest<AudioFilesResponse>(
      `/api/audio/my-audio-files?expirationMinutes=${expirationMinutes}`
    );
  }

  async getAudioFile(id: string, expirationMinutes: number = 60): Promise<ApiResponse<AudioFile>> {
    return this.makeRequest<AudioFile>(
      `/api/audio/${id}?expirationMinutes=${expirationMinutes}`
    );
  }

  async deleteAudioFile(audioFileId: string): Promise<ApiResponse<{ message: string }>> {
    return this.makeRequest<{ message: string }>(`/api/audio/${audioFileId}`, {
      method: 'DELETE'
    });
  }

  async checkFileExists(fileName: string): Promise<ApiResponse<{ exists: boolean }>> {
    return this.makeRequest<{ exists: boolean }>(`/api/audio/${encodeURIComponent(fileName)}/exists`);
  }

  // Upload file directly to S3 using pre-signed URL
  async uploadFileToS3(uploadUrl: string, file: any, contentType: string): Promise<boolean> {
    try {
      const response = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': contentType,
        },
        body: file,
      });

      return response.ok;
    } catch (error) {
      console.error('Error uploading file to S3:', error);
      return false;
    }
  }
}

export const apiService = new ApiService(); 