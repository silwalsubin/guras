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

// AI API types
export interface AIRequest {
  question: string;
  teacherId: string;
  userLevel: string;
  currentChallenges: string[];
  spiritualGoals: string[];
  recentInsights: string[];
  practiceHistory: string[];
  emotionalState: string;
  conversationHistory: string[];
}

export interface AIResponse {
  response: string;
  followUpQuestions: string[];
  relatedTeachings: string[];
  practice?: string;
  source: string;
  confidence: number;
  processingTimeMs: number;
  error?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: string;
    field?: string;
  };
  traceId: string;
  timestamp: string;
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

  async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const fullUrl = `${API_CONFIG.BASE_URL}${endpoint}`;

    try {
      console.log('🌐 Making API request to:', fullUrl);

      const token = await this.getAuthToken();
      if (!token) {
        console.error('❌ No authentication token available');
        return {
          success: false,
          error: {
            code: 'AUTH_ERROR',
            message: 'No authentication token available'
          },
          traceId: '',
          timestamp: new Date().toISOString()
        };
      }

      console.log('🔑 Using auth token (first 20 chars):', token.substring(0, 20) + '...');

      const response = await fetch(fullUrl, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          ...options.headers,
        },
      });

      console.log('📡 Response received:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        url: fullUrl
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        console.error('❌ API Error:', {
          status: response.status,
          statusText: response.statusText,
          responseData,
          url: fullUrl
        });
        
        // Handle new standardized error format
        if (responseData.error) {
          return {
            success: false,
            error: responseData.error,
            traceId: responseData.traceId || '',
            timestamp: responseData.timestamp || new Date().toISOString()
          };
        }
        
        // Fallback for legacy error format
        return {
          success: false,
          error: {
            code: 'HTTP_ERROR',
            message: `HTTP ${response.status}: ${responseData.message || response.statusText}`
          },
          traceId: responseData.traceId || '',
          timestamp: responseData.timestamp || new Date().toISOString()
        };
      }

      console.log('✅ API Success for:', fullUrl, { traceId: responseData.traceId });
      
      // Handle new standardized success format
      if (responseData.success !== undefined) {
        return responseData;
      }
      
      // Fallback for legacy success format (direct data)
      return {
        success: true,
        data: responseData,
        traceId: '',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Network Error:', {
        url: fullUrl,
        error: error instanceof Error ? error.message : 'Unknown error',
        name: error instanceof Error ? error.name : 'Unknown',
        stack: error instanceof Error ? error.stack : undefined
      });
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Network request failed'
        },
        traceId: '',
        timestamp: new Date().toISOString()
      };
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

  // AI API methods
  async generateAIResponse(request: AIRequest): Promise<ApiResponse<AIResponse>> {
    return this.makeRequest<AIResponse>('/api/spiritualai/generate-response', {
      method: 'POST',
      body: JSON.stringify(request)
    });
  }

  async getDailyGuidance(teacherId: string, userId: string): Promise<ApiResponse<AIResponse>> {
    return this.makeRequest<AIResponse>(
      `/api/spiritualai/daily-guidance?teacherId=${encodeURIComponent(teacherId)}&userId=${encodeURIComponent(userId)}`,
      { method: 'POST' }
    );
  }

  async checkAIHealth(): Promise<ApiResponse<{ isAvailable: boolean; stats: any; timestamp: string }>> {
    return this.makeRequest<{ isAvailable: boolean; stats: any; timestamp: string }>('/api/spiritualai/health');
  }

  async getAIStats(): Promise<ApiResponse<any>> {
    return this.makeRequest<any>('/api/spiritualai/stats');
  }



  // Meditation Recommendation methods
  async getPersonalizedRecommendations(count: number = 3): Promise<ApiResponse<any[]>> {
    return this.makeRequest<any[]>(
      `/api/meditationrecommendation/personalized?count=${count}`
    );
  }

  async getRecommendationReason(sessionTitle: string): Promise<ApiResponse<{ sessionTitle: string; reason: string }>> {
    return this.makeRequest<{ sessionTitle: string; reason: string }>(
      `/api/meditationrecommendation/reason?sessionTitle=${encodeURIComponent(sessionTitle)}`
    );
  }

  // AI-Recommended Quote methods
  async getAIRecommendedQuote(): Promise<ApiResponse<any>> {
    return this.makeRequest<any>('/api/quotes/ai-recommended');
  }

  async getRecommendationsByTime(timeOfDay: string, count: number = 3): Promise<ApiResponse<any[]>> {
    return this.makeRequest<any[]>(
      `/api/meditationrecommendation/by-time?timeOfDay=${encodeURIComponent(timeOfDay)}&count=${count}`
    );
  }

  async getRecommendationsByEmotion(emotionalState: string, count: number = 3): Promise<ApiResponse<any[]>> {
    return this.makeRequest<any[]>(
      `/api/meditationrecommendation/by-emotion?emotionalState=${encodeURIComponent(emotionalState)}&count=${count}`
    );
  }

  async logRecommendationEvent(event: any): Promise<ApiResponse<{ message: string }>> {
    return this.makeRequest<{ message: string }>(
      '/api/meditationanalytics/recommendation-event',
      {
        method: 'POST',
        body: JSON.stringify(event)
      }
    );
  }
}

export const apiService = new ApiService(); 