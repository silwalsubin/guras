import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { apiService } from '@/services/api';
import { COLORS } from '@/config/colors';

export const AudioUploadExample: React.FC = () => {
  const [uploading, setUploading] = useState(false);

  const uploadAudioFile = async () => {
    try {
      // Step 1: Pick an audio file
      launchImageLibrary(
        {
          mediaType: 'mixed', // Allow both audio and video
          quality: 1,
        },
        async (response) => {
          if (response.didCancel || response.errorMessage) {
            return;
          }

          const asset = response.assets?.[0];
          if (!asset || !asset.uri || !asset.fileName) {
            Alert.alert('Error', 'No file selected');
            return;
          }

          setUploading(true);

          try {
            // Step 2: Get pre-signed upload URL
            const uploadUrlResponse = await apiService.getUploadUrl(asset.fileName);
            if (!uploadUrlResponse.data) {
              Alert.alert('Error', uploadUrlResponse.error || 'Failed to get upload URL');
              return;
            }

            // Step 3: Prepare file for upload
            const fileData = {
              uri: asset.uri,
              type: asset.type || 'audio/mpeg',
              name: asset.fileName,
            };

            // Step 4: Upload to S3
            const uploadSuccess = await apiService.uploadFileToS3(
              uploadUrlResponse.data.uploadUrl,
              fileData,
              asset.type || 'audio/mpeg'
            );

            if (uploadSuccess) {
              Alert.alert(
                'Success',
                `Audio file uploaded successfully!\nFile: ${uploadUrlResponse.data.fileName}`
              );
            } else {
              Alert.alert('Error', 'Failed to upload file to S3');
            }
          } catch (error) {
            console.error('Upload error:', error);
            Alert.alert('Error', 'Failed to upload audio file');
          } finally {
            setUploading(false);
          }
        }
      );
    } catch (error) {
      console.error('File picker error:', error);
      Alert.alert('Error', 'Failed to pick audio file');
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upload Audio File</Text>
      <Text style={styles.description}>
        Select an audio file from your device to upload to S3
      </Text>

      <TouchableOpacity
        style={[styles.uploadButton, uploading && styles.uploadButtonDisabled]}
        onPress={uploadAudioFile}
        disabled={uploading}
      >
        {uploading ? (
          <View style={styles.uploadingContainer}>
            <ActivityIndicator size="small" color={COLORS.WHITE} />
            <Text style={styles.uploadButtonText}>Uploading...</Text>
          </View>
        ) : (
          <Text style={styles.uploadButtonText}>Select & Upload Audio</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY_LIGHT,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY_LIGHT,
    textAlign: 'center',
    marginBottom: 24,
  },
  uploadButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 200,
    alignItems: 'center',
  },
  uploadButtonDisabled: {
    backgroundColor: COLORS.GRAY_400,
  },
  uploadButtonText: {
    color: COLORS.WHITE,
    fontSize: 16,
    fontWeight: '600',
  },
  uploadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
}); 