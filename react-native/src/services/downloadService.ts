import RNFS from 'react-native-fs';
import { AudioFile } from './api';

export interface DownloadProgress {
  id: string;
  progress: number; // 0-100
  bytesWritten: number;
  contentLength: number;
  status: 'downloading' | 'completed' | 'failed' | 'paused';
}

export interface LocalAudioFile extends AudioFile {
  localAudioPath?: string;
  localThumbnailPath?: string;
  downloadedAt?: string;
  isDownloaded: boolean;
}

class DownloadService {
  private downloadDir: string = '';
  private activeDownloads: Map<string, any> = new Map();
  private progressCallbacks: Map<string, (progress: DownloadProgress) => void> = new Map();
  private isInitialized: boolean = false;
  private initializationError: Error | null = null;

  constructor() {
    // Use app's documents directory for downloads
    this.downloadDir = `${RNFS.DocumentDirectoryPath}/audio_downloads`;
    // Initialize directory asynchronously to avoid blocking constructor
    setTimeout(() => {
      this.ensureDownloadDirectory()
        .then(() => {
          this.isInitialized = true;
        })
        .catch(error => {
          console.error('Failed to initialize download directory:', error);
          this.initializationError = error;
        });
    }, 100);
  }

  private async checkInitialization(): Promise<void> {
    if (this.initializationError) {
      throw this.initializationError;
    }

    if (!this.isInitialized) {
      // Try to initialize now
      await this.ensureDownloadDirectory();
      this.isInitialized = true;
    }
  }

  private async ensureDownloadDirectory(): Promise<void> {
    try {
      // Check if RNFS is available
      if (!RNFS) {
        throw new Error('react-native-fs is not available');
      }

      // Check if RNFS is properly initialized
      if (!RNFS.DocumentDirectoryPath) {
        throw new Error('RNFS not properly initialized');
      }

      const exists = await RNFS.exists(this.downloadDir);
      if (!exists) {
        await RNFS.mkdir(this.downloadDir);
      }
    } catch (error) {
      console.error('Failed to create download directory:', error);
      throw error;
    }
  }

  private getLocalAudioPath(audioFile: AudioFile): string {
    const extension = this.getFileExtension(audioFile.audioDownloadUrl) || 'mp3';
    return `${this.downloadDir}/${audioFile.id}_audio.${extension}`;
  }

  private getLocalThumbnailPath(audioFile: AudioFile): string {
    if (!audioFile.thumbnailDownloadUrl) return '';
    const extension = this.getFileExtension(audioFile.thumbnailDownloadUrl) || 'jpg';
    return `${this.downloadDir}/${audioFile.id}_thumbnail.${extension}`;
  }

  private getFileExtension(url: string): string | null {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const lastDot = pathname.lastIndexOf('.');
      if (lastDot > 0) {
        return pathname.substring(lastDot + 1).toLowerCase();
      }
    } catch (error) {
      // Invalid URL, try to extract from string
      const match = url.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
      return match ? match[1].toLowerCase() : null;
    }
    return null;
  }

  async downloadAudioFile(
    audioFile: AudioFile,
    onProgress?: (progress: DownloadProgress) => void
  ): Promise<LocalAudioFile> {
    const audioId = audioFile.id;

    // Ensure service is initialized
    await this.checkInitialization();

    // Check if already downloading
    if (this.activeDownloads.has(audioId)) {
      throw new Error('File is already being downloaded');
    }

    // Check if already downloaded
    const isAlreadyDownloaded = await this.isFileDownloaded(audioFile);
    if (isAlreadyDownloaded) {
      return this.getLocalAudioFile(audioFile);
    }

    const localAudioPath = this.getLocalAudioPath(audioFile);
    const localThumbnailPath = this.getLocalThumbnailPath(audioFile);

    try {
      // Store progress callback
      if (onProgress) {
        this.progressCallbacks.set(audioId, onProgress);
      }

      // Download audio file
      const audioDownload = RNFS.downloadFile({
        fromUrl: audioFile.audioDownloadUrl,
        toFile: localAudioPath,
        progress: (res) => {
          const progress: DownloadProgress = {
            id: audioId,
            progress: (res.bytesWritten / res.contentLength) * 100,
            bytesWritten: res.bytesWritten,
            contentLength: res.contentLength,
            status: 'downloading'
          };
          
          const callback = this.progressCallbacks.get(audioId);
          if (callback) {
            callback(progress);
          }
        }
      });

      this.activeDownloads.set(audioId, audioDownload);
      const audioResult = await audioDownload.promise;

      if (audioResult.statusCode !== 200) {
        throw new Error(`Failed to download audio: HTTP ${audioResult.statusCode}`);
      }

      // Download thumbnail if available
      let thumbnailSuccess = true;
      if (audioFile.thumbnailDownloadUrl && localThumbnailPath) {
        try {
          const thumbnailDownload = RNFS.downloadFile({
            fromUrl: audioFile.thumbnailDownloadUrl,
            toFile: localThumbnailPath,
          });

          const thumbnailResult = await thumbnailDownload.promise;
          thumbnailSuccess = thumbnailResult.statusCode === 200;
        } catch (thumbnailError) {
          console.warn('Failed to download thumbnail:', thumbnailError);
          thumbnailSuccess = false;
        }
      }

      // Save metadata
      await this.saveDownloadMetadata(audioFile, localAudioPath, thumbnailSuccess ? localThumbnailPath : undefined);

      // Final progress callback
      const finalProgress: DownloadProgress = {
        id: audioId,
        progress: 100,
        bytesWritten: audioResult.bytesWritten || 0,
        contentLength: audioResult.bytesWritten || 0,
        status: 'completed'
      };

      const callback = this.progressCallbacks.get(audioId);
      if (callback) {
        callback(finalProgress);
      }

      return this.getLocalAudioFile(audioFile);

    } catch (error) {
      // Cleanup on error
      try {
        await RNFS.unlink(localAudioPath);
        if (localThumbnailPath) {
          await RNFS.unlink(localThumbnailPath);
        }
      } catch (cleanupError) {
        // Ignore cleanup errors
      }

      const errorProgress: DownloadProgress = {
        id: audioId,
        progress: 0,
        bytesWritten: 0,
        contentLength: 0,
        status: 'failed'
      };

      const callback = this.progressCallbacks.get(audioId);
      if (callback) {
        callback(errorProgress);
      }

      throw error;
    } finally {
      this.activeDownloads.delete(audioId);
      this.progressCallbacks.delete(audioId);
    }
  }

  async cancelDownload(audioId: string): Promise<void> {
    const download = this.activeDownloads.get(audioId);
    if (download) {
      download.stop();
      this.activeDownloads.delete(audioId);
      this.progressCallbacks.delete(audioId);
    }
  }

  async isFileDownloaded(audioFile: AudioFile): Promise<boolean> {
    const localAudioPath = this.getLocalAudioPath(audioFile);
    return await RNFS.exists(localAudioPath);
  }

  async getLocalAudioFile(audioFile: AudioFile): Promise<LocalAudioFile> {
    const localAudioPath = this.getLocalAudioPath(audioFile);
    const localThumbnailPath = this.getLocalThumbnailPath(audioFile);
    
    const isDownloaded = await this.isFileDownloaded(audioFile);
    const thumbnailExists = localThumbnailPath ? await RNFS.exists(localThumbnailPath) : false;

    const metadata = await this.getDownloadMetadata(audioFile.id);

    return {
      ...audioFile,
      localAudioPath: isDownloaded ? `file://${localAudioPath}` : undefined,
      localThumbnailPath: thumbnailExists ? `file://${localThumbnailPath}` : undefined,
      downloadedAt: metadata?.downloadedAt,
      isDownloaded
    };
  }

  async deleteDownloadedFile(audioFile: AudioFile): Promise<void> {
    const localAudioPath = this.getLocalAudioPath(audioFile);
    const localThumbnailPath = this.getLocalThumbnailPath(audioFile);

    try {
      // Delete audio file
      const audioExists = await RNFS.exists(localAudioPath);
      if (audioExists) {
        await RNFS.unlink(localAudioPath);
      }

      // Delete thumbnail
      if (localThumbnailPath) {
        const thumbnailExists = await RNFS.exists(localThumbnailPath);
        if (thumbnailExists) {
          await RNFS.unlink(localThumbnailPath);
        }
      }

      // Delete metadata
      await this.deleteDownloadMetadata(audioFile.id);

    } catch (error) {
      console.error('Failed to delete downloaded file:', error);
      throw error;
    }
  }

  async getAllDownloadedFiles(): Promise<LocalAudioFile[]> {
    try {
      await this.checkInitialization();

      const exists = await RNFS.exists(this.downloadDir);
      if (!exists) {
        await this.ensureDownloadDirectory();
        return [];
      }

      const metadataFiles = await RNFS.readDir(this.downloadDir);
      const audioFiles: LocalAudioFile[] = [];

      for (const file of metadataFiles) {
        if (file.name.endsWith('_metadata.json')) {
          try {
            const metadataContent = await RNFS.readFile(file.path, 'utf8');
            const metadata = JSON.parse(metadataContent);
            const localFile = await this.getLocalAudioFile(metadata.originalFile);
            audioFiles.push(localFile);
          } catch (error) {
            console.warn('Failed to read metadata file:', file.name, error);
          }
        }
      }

      return audioFiles;
    } catch (error) {
      console.error('Failed to get downloaded files:', error);
      return [];
    }
  }

  private async saveDownloadMetadata(
    audioFile: AudioFile,
    localAudioPath: string,
    localThumbnailPath?: string
  ): Promise<void> {
    const metadata = {
      originalFile: audioFile,
      localAudioPath,
      localThumbnailPath,
      downloadedAt: new Date().toISOString()
    };

    const metadataPath = `${this.downloadDir}/${audioFile.id}_metadata.json`;
    await RNFS.writeFile(metadataPath, JSON.stringify(metadata, null, 2), 'utf8');
  }

  private async getDownloadMetadata(audioId: string): Promise<any | null> {
    try {
      const metadataPath = `${this.downloadDir}/${audioId}_metadata.json`;
      const exists = await RNFS.exists(metadataPath);
      if (!exists) return null;

      const content = await RNFS.readFile(metadataPath, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      return null;
    }
  }

  private async deleteDownloadMetadata(audioId: string): Promise<void> {
    try {
      const metadataPath = `${this.downloadDir}/${audioId}_metadata.json`;
      const exists = await RNFS.exists(metadataPath);
      if (exists) {
        await RNFS.unlink(metadataPath);
      }
    } catch (error) {
      console.warn('Failed to delete metadata:', error);
    }
  }

  async getDownloadedSize(): Promise<number> {
    try {
      await this.checkInitialization();

      const exists = await RNFS.exists(this.downloadDir);
      if (!exists) {
        await this.ensureDownloadDirectory();
        return 0;
      }

      const files = await RNFS.readDir(this.downloadDir);
      let totalSize = 0;

      for (const file of files) {
        if (file.isFile()) {
          totalSize += file.size;
        }
      }

      return totalSize;
    } catch (error) {
      console.error('Failed to calculate downloaded size:', error);
      return 0;
    }
  }

  async clearAllDownloads(): Promise<void> {
    try {
      const exists = await RNFS.exists(this.downloadDir);
      if (exists) {
        await RNFS.unlink(this.downloadDir);
        await this.ensureDownloadDirectory();
      }
    } catch (error) {
      console.error('Failed to clear downloads:', error);
      throw error;
    }
  }
}

export const downloadService = new DownloadService();
