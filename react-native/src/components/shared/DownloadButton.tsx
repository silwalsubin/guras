import React, { useState } from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { getThemeColors, getBrandColors } from '@/config/colors';
import { useDownload } from '@/contexts/DownloadContext';
import { AudioFile } from '@/services/api';
import Icon from 'react-native-vector-icons/FontAwesome';

interface DownloadButtonProps {
  audioFile: AudioFile;
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
  onDownloadStart?: () => void;
  onDownloadComplete?: () => void;
  onDownloadError?: (error: Error) => void;
}

const DownloadButton: React.FC<DownloadButtonProps> = ({
  audioFile,
  size = 'medium',
  showText = false,
  onDownloadStart,
  onDownloadComplete,
  onDownloadError,
}) => {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const themeColors = getThemeColors(isDarkMode);
  const brandColors = getBrandColors();
  
  const {
    isDownloading,
    isDownloaded,
    downloadFile,
    deleteDownload,
    cancelDownload,
    downloadProgress,
  } = useDownload();

  const [isProcessing, setIsProcessing] = useState(false);

  const downloading = isDownloading(audioFile.id);
  const downloaded = isDownloaded(audioFile.id);
  const progress = downloadProgress.get(audioFile.id);

  const handlePress = async () => {
    if (isProcessing) return;

    try {
      setIsProcessing(true);

      if (downloading) {
        // Cancel download
        await cancelDownload(audioFile.id);
      } else if (downloaded) {
        // Show options to delete
        Alert.alert(
          'Downloaded File',
          'This file is already downloaded. What would you like to do?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Delete Download',
              style: 'destructive',
              onPress: async () => {
                try {
                  await deleteDownload(audioFile);
                } catch (error) {
                  Alert.alert('Error', 'Failed to delete downloaded file');
                  if (onDownloadError) {
                    onDownloadError(error as Error);
                  }
                }
              },
            },
          ]
        );
      } else {
        // Start download
        if (onDownloadStart) {
          onDownloadStart();
        }

        await downloadFile(audioFile);
        
        if (onDownloadComplete) {
          onDownloadComplete();
        }
      }
    } catch (error) {
      console.error('Download operation failed:', error);
      Alert.alert(
        'Download Failed',
        error instanceof Error ? error.message : 'An unknown error occurred'
      );
      
      if (onDownloadError) {
        onDownloadError(error as Error);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const getIconName = () => {
    if (downloading) return 'times';
    if (downloaded) return 'check-circle';
    return 'download';
  };

  const getIconColor = () => {
    if (downloading) return '#ff6b6b';
    if (downloaded) return '#51cf66';
    return themeColors.textSecondary;
  };

  const getButtonText = () => {
    if (downloading) return 'Cancel';
    if (downloaded) return 'Downloaded';
    return 'Download';
  };

  const iconSize = size === 'small' ? 16 : size === 'medium' ? 20 : 24;
  const buttonSize = size === 'small' ? 32 : size === 'medium' ? 40 : 48;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          width: buttonSize,
          height: buttonSize,
          backgroundColor: downloaded 
            ? 'rgba(81, 207, 102, 0.1)' 
            : downloading 
            ? 'rgba(255, 107, 107, 0.1)'
            : 'transparent',
          borderColor: downloaded 
            ? '#51cf66' 
            : downloading 
            ? '#ff6b6b'
            : themeColors.border,
        },
        showText && styles.buttonWithText,
      ]}
      onPress={handlePress}
      disabled={isProcessing}
    >
      {downloading && progress ? (
        <View style={styles.progressContainer}>
          <ActivityIndicator size="small" color="#ff6b6b" />
          {showText && (
            <Text style={[styles.progressText, { color: themeColors.textSecondary }]}>
              {Math.round(progress.progress)}%
            </Text>
          )}
        </View>
      ) : (
        <View style={[styles.iconContainer, showText && styles.iconWithText]}>
          <Icon
            name={getIconName()}
            size={iconSize}
            color={getIconColor()}
          />
          {showText && (
            <Text style={[styles.buttonText, { color: getIconColor() }]}>
              {getButtonText()}
            </Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonWithText: {
    width: 'auto',
    minWidth: 80,
    paddingHorizontal: 12,
    height: 36,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '500',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWithText: {
    flexDirection: 'row',
    gap: 6,
  },
  buttonText: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default DownloadButton;
