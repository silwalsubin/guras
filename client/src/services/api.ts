import axios, { type AxiosInstance, type AxiosResponse } from 'axios'
import { authService } from './auth'

// API Configuration
const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://localhost:7001',
  TIMEOUT: 10000,
}

// Types
export interface AudioFile {
  id: string
  name: string
  author: string
  description?: string
  durationSeconds?: number
  fileSizeBytes?: number
  audioDownloadUrl: string
  thumbnailDownloadUrl?: string
  uploadedByUserId: string
  createdAt: string
  updatedAt: string
}

export interface AudioFilesResponse {
  files: AudioFile[]
  totalCount: number
  expirationMinutes: number
}

export interface GetUploadUrlsRequest {
  name: string
  author: string
  description?: string
  durationSeconds?: number
  fileSizeBytes?: number
  audioFileName: string
  thumbnailFileName?: string
  audioContentType?: string
  thumbnailContentType?: string
  expirationMinutes?: number
}

export interface GetUploadUrlsResponse {
  audioFileId: string
  audioUploadUrl: string
  thumbnailUploadUrl?: string
  audioS3Key: string
  thumbnailS3Key?: string
  expiresAt: string
}

export interface ApiResponse<T> {
  data?: T
  error?: string
}

class ApiService {
  private axiosInstance: AxiosInstance

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Request interceptor for adding auth token
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        // Add Firebase auth token if available
        const token = await authService.getAuthToken()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }

        // Handle FormData - remove Content-Type to let browser set it with boundary
        if (config.data instanceof FormData) {
          delete config.headers['Content-Type']
        }

        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => {
        console.error('API Error:', error)
        if (error.response?.status === 401) {
          // Handle unauthorized access - sign out user
          authService.signOutUser()
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }
    )
  }

  private async makeRequest<T>(
    url: string,
    options: {
      method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
      data?: any
      params?: any
      headers?: any
    } = {}
  ): Promise<ApiResponse<T>> {
    try {
      const config: any = {
        url,
        method: options.method || 'GET',
        data: options.data,
        params: options.params,
      }

      // Handle FormData - don't set Content-Type, let browser handle it
      if (options.data instanceof FormData) {
        // For FormData, we need to let the browser set the Content-Type with boundary
        config.headers = {
          ...options.headers,
        }
        // Explicitly remove Content-Type for FormData
        delete config.headers['Content-Type']
      } else if (options.headers) {
        config.headers = options.headers
      }

      const response = await this.axiosInstance(config)

      return { data: response.data }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'An error occurred'
      return { error: errorMessage }
    }
  }

  // Audio file management methods
  async getAudioFiles(expirationMinutes: number = 60): Promise<ApiResponse<AudioFilesResponse>> {
    return this.makeRequest<AudioFilesResponse>('/api/audio/audio-files', {
      params: { expirationMinutes }
    })
  }

  async getMyAudioFiles(expirationMinutes: number = 60): Promise<ApiResponse<AudioFilesResponse>> {
    return this.makeRequest<AudioFilesResponse>('/api/audio/my-audio-files', {
      params: { expirationMinutes }
    })
  }

  async getUploadUrls(request: GetUploadUrlsRequest): Promise<ApiResponse<GetUploadUrlsResponse>> {
    return this.makeRequest<GetUploadUrlsResponse>('/api/audio/upload-urls', {
      method: 'POST',
      data: request
    })
  }

  async deleteAudioFile(audioFileId: string): Promise<ApiResponse<{ message: string }>> {
    return this.makeRequest<{ message: string }>(`/api/audio/${audioFileId}`, {
      method: 'DELETE'
    })
  }

  async checkFileExists(fileName: string): Promise<ApiResponse<{ exists: boolean }>> {
    return this.makeRequest<{ exists: boolean }>(`/api/audio/${encodeURIComponent(fileName)}/exists`)
  }

  // Upload file directly to S3 using pre-signed URL
  async uploadFileToS3(uploadUrl: string, file: File): Promise<boolean> {
    try {
      const response = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type,
        },
        body: file,
      })

      return response.ok
    } catch (error) {
      console.error('Error uploading file to S3:', error)
      return false
    }
  }

  // Upload both audio file and thumbnail
  async uploadAudioWithThumbnail(
    audioFile: File,
    thumbnailFile: File,
    metadata: {
      name: string
      author: string
      description?: string
    }
  ): Promise<{
    success: boolean
    audioFileId?: string
    error?: string
  }> {
    try {
      // Create FormData for multipart upload
      const formData = new FormData()
      formData.append('Name', metadata.name)
      formData.append('Author', metadata.author)
      if (metadata.description) {
        formData.append('Description', metadata.description)
      }
      formData.append('AudioFile', audioFile)
      formData.append('ThumbnailFile', thumbnailFile)

      // Upload to API server
      const response = await this.makeRequest<AudioFile>('/api/audio/upload', {
        method: 'POST',
        data: formData,
        headers: {
          // Don't set Content-Type, let browser set it with boundary for multipart
        }
      })

      if (response.error || !response.data) {
        return { success: false, error: response.error || 'Failed to upload files' }
      }

      return {
        success: true,
        audioFileId: response.data.id
      }
    } catch (error: any) {
      return { success: false, error: error.message || 'Upload failed' }
    }
  }
}

export const apiService = new ApiService()
export default apiService
