import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { downloadService, DownloadProgress, LocalAudioFile } from '@/services/downloadService';
import { AudioFile } from '@/services/api';

interface DownloadContextType {
  downloadedFiles: LocalAudioFile[];
  downloadProgress: Map<string, DownloadProgress>;
  isDownloading: (audioId: string) => boolean;
  isDownloaded: (audioId: string) => boolean;
  downloadFile: (audioFile: AudioFile) => Promise<void>;
  deleteDownload: (audioFile: AudioFile) => Promise<void>;
  cancelDownload: (audioId: string) => Promise<void>;
  refreshDownloads: () => Promise<void>;
  getTotalDownloadedSize: () => Promise<number>;
  clearAllDownloads: () => Promise<void>;
  getLocalFile: (audioFile: AudioFile) => LocalAudioFile | null;
}

const DownloadContext = createContext<DownloadContextType | undefined>(undefined);

export const useDownload = () => {
  const ctx = useContext(DownloadContext);
  if (!ctx) throw new Error('useDownload must be used within a DownloadProvider');
  return ctx;
};

export const DownloadProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [downloadedFiles, setDownloadedFiles] = useState<LocalAudioFile[]>([]);
  const [downloadProgress, setDownloadProgress] = useState<Map<string, DownloadProgress>>(new Map());
  const [isDownloadServiceAvailable, setIsDownloadServiceAvailable] = useState(true);

  // Load downloaded files on mount with error handling
  useEffect(() => {
    // Delay initialization to ensure native modules are ready
    const timer = setTimeout(() => {
      refreshDownloads().catch(error => {
        console.error('Failed to initialize downloads:', error);
      });
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const refreshDownloads = useCallback(async () => {
    if (!isDownloadServiceAvailable) return;

    try {
      const files = await downloadService.getAllDownloadedFiles();
      setDownloadedFiles(files);
    } catch (error) {
      console.error('Failed to refresh downloads:', error);
      // If this fails, disable download service
      setIsDownloadServiceAvailable(false);
    }
  }, [isDownloadServiceAvailable]);

  const isDownloading = useCallback((audioId: string): boolean => {
    const progress = downloadProgress.get(audioId);
    return progress?.status === 'downloading';
  }, [downloadProgress]);

  const isDownloaded = useCallback((audioId: string): boolean => {
    return downloadedFiles.some(file => file.id === audioId && file.isDownloaded);
  }, [downloadedFiles]);

  const getLocalFile = useCallback((audioFile: AudioFile): LocalAudioFile | null => {
    return downloadedFiles.find(file => file.id === audioFile.id) || null;
  }, [downloadedFiles]);

  const downloadFile = useCallback(async (audioFile: AudioFile) => {
    try {
      // Check if already downloaded
      if (isDownloaded(audioFile.id)) {
        return;
      }

      // Check if already downloading
      if (isDownloading(audioFile.id)) {
        return;
      }

      // Start download with progress tracking
      await downloadService.downloadAudioFile(audioFile, (progress) => {
        setDownloadProgress(prev => {
          const newMap = new Map(prev);
          newMap.set(audioFile.id, progress);
          return newMap;
        });
      });

      // Refresh downloaded files list
      await refreshDownloads();

      // Clear progress after successful download
      setDownloadProgress(prev => {
        const newMap = new Map(prev);
        newMap.delete(audioFile.id);
        return newMap;
      });

    } catch (error) {
      console.error('Download failed:', error);
      
      // Clear progress on error
      setDownloadProgress(prev => {
        const newMap = new Map(prev);
        newMap.delete(audioFile.id);
        return newMap;
      });
      
      throw error;
    }
  }, [isDownloaded, isDownloading, refreshDownloads]);

  const deleteDownload = useCallback(async (audioFile: AudioFile) => {
    try {
      await downloadService.deleteDownloadedFile(audioFile);
      await refreshDownloads();
    } catch (error) {
      console.error('Failed to delete download:', error);
      throw error;
    }
  }, [refreshDownloads]);

  const cancelDownload = useCallback(async (audioId: string) => {
    try {
      await downloadService.cancelDownload(audioId);
      
      // Clear progress
      setDownloadProgress(prev => {
        const newMap = new Map(prev);
        newMap.delete(audioId);
        return newMap;
      });
    } catch (error) {
      console.error('Failed to cancel download:', error);
      throw error;
    }
  }, []);

  const getTotalDownloadedSize = useCallback(async (): Promise<number> => {
    try {
      return await downloadService.getDownloadedSize();
    } catch (error) {
      console.error('Failed to get downloaded size:', error);
      return 0;
    }
  }, []);

  const clearAllDownloads = useCallback(async () => {
    try {
      await downloadService.clearAllDownloads();
      setDownloadedFiles([]);
      setDownloadProgress(new Map());
    } catch (error) {
      console.error('Failed to clear all downloads:', error);
      throw error;
    }
  }, []);

  return (
    <DownloadContext.Provider value={{
      downloadedFiles,
      downloadProgress,
      isDownloading,
      isDownloaded,
      downloadFile,
      deleteDownload,
      cancelDownload,
      refreshDownloads,
      getTotalDownloadedSize,
      clearAllDownloads,
      getLocalFile
    }}>
      {children}
    </DownloadContext.Provider>
  );
};
