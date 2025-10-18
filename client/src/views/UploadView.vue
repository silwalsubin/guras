<template>
  <div class="upload-view">
    <div class="header">
      <h1>Audio File Upload</h1>
      <p>Upload your audio files and thumbnails to the Guras platform</p>
    </div>

    <div class="main-content">
      <AudioUploadForm
        @upload-success="handleUploadSuccess"
        @upload-error="handleUploadError"
      />
      


      <div v-if="allAudioFiles.length > 0" class="all-files">
        <div class="section-header">
          <h2>Audio Files</h2>
          <div class="header-actions">
            <div class="view-toggle">
              <button
                class="btn btn-sm"
                :class="{ 'btn-primary': showMyFiles, 'btn-secondary': !showMyFiles }"
                @click="toggleView(true)"
              >
                My Files
              </button>
              <button
                class="btn btn-sm"
                :class="{ 'btn-primary': !showMyFiles, 'btn-secondary': showMyFiles }"
                @click="toggleView(false)"
              >
                All Files
              </button>
            </div>
            <button class="btn btn-secondary" @click="refreshFiles" :disabled="isLoading">
              <span class="refresh-icon">🔄</span>
              Refresh
            </button>
          </div>
        </div>
        
        <div class="files-grid">
          <div
            v-for="file in allAudioFiles"
            :key="file.id"
            class="file-card"
          >
            <div class="file-thumbnail">
              <img
                v-if="file.thumbnailDownloadUrl"
                :src="file.thumbnailDownloadUrl"
                :alt="`${file.name} thumbnail`"
                class="artwork-image"
              />
              <div v-else class="default-artwork">🎵</div>
            </div>
            <div class="file-info">
              <h3>{{ file.name }}</h3>
              <p v-if="file.author">{{ file.author }}</p>
              <p v-if="file.description" class="description">{{ file.description }}</p>
              <span class="file-meta">{{ formatDate(file.createdAt) }}</span>
            </div>
            <div class="file-actions">
              <a
                :href="file.audioDownloadUrl"
                target="_blank"
                class="btn btn-sm btn-primary"
                title="Download audio file"
              >
                Download
              </a>
              <button
                class="btn btn-sm btn-danger"
                @click="deleteFile(file.id, file.name)"
                :disabled="deletingFiles.has(file.id)"
                title="Delete file"
              >
                <span v-if="deletingFiles.has(file.id)">Deleting...</span>
                <span v-else>Delete</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import { useAuthStore } from '@/stores/auth'
import AudioUploadForm from '@/components/AudioUploadForm.vue'
import { apiService, type AudioFile } from '@/services/api'

// Reactive state
const allAudioFiles = ref<AudioFile[]>([])
const isLoading = ref(false)
const deletingFiles = ref<Set<string>>(new Set())
const showMyFiles = ref(true)

const toast = useToast()
const authStore = useAuthStore()

// Methods
const handleUploadSuccess = (audioFileId: string) => {
  toast.success('Audio file uploaded successfully!')
  // Refresh the files list to show newly uploaded files
  refreshFiles()
}

const handleUploadError = (error: string) => {
  toast.error('Upload failed: ' + error)
}

const refreshFiles = async () => {
  isLoading.value = true
  try {
    const response = showMyFiles.value
      ? await apiService.getMyAudioFiles()
      : await apiService.getAudioFiles()

    if (response.success && response.data) {
      allAudioFiles.value = response.data.files
      const fileType = showMyFiles.value ? 'your' : 'all'
      toast.success(`Loaded ${response.data.files.length} ${fileType} audio files`)
    } else {
      const errorMessage = response.error?.message || 'Failed to load audio files'
      toast.error(errorMessage)
    }
  } catch (error: any) {
    toast.error('Error loading audio files: ' + error.message)
  } finally {
    isLoading.value = false
  }
}

const toggleView = (myFiles: boolean) => {
  showMyFiles.value = myFiles
  refreshFiles()
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

const deleteFile = async (fileId: string, fileName: string) => {
  if (!confirm(`Are you sure you want to delete "${fileName}"?\n\nThis action cannot be undone.`)) {
    return
  }

  // Add to deleting set to show loading state
  deletingFiles.value.add(fileId)

  try {
    const response = await apiService.deleteAudioFile(fileId)
    if (response.success && response.data) {
      toast.success(`"${fileName}" deleted successfully`)
      allAudioFiles.value = allAudioFiles.value.filter(file => file.id !== fileId)
    } else {
      const errorMessage = response.error?.message || 'Failed to delete file'
      toast.error(errorMessage)
    }
  } catch (error: any) {
    toast.error('Error deleting file: ' + error.message)
  } finally {
    // Remove from deleting set
    deletingFiles.value.delete(fileId)
  }
}

const viewFile = (upload: any) => {
  // For now, just show an alert with file details
  // In a real app, you might navigate to a detail view
  alert(`File Details:\nAudio: ${upload.audioFileName}\nThumbnail: ${upload.thumbnailFileName || 'None'}`)
}

// Lifecycle
onMounted(() => {
  refreshFiles()
})
</script>

<style scoped>
.upload-view {
  min-height: 100vh;
  width: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  margin: 0;
  flex: 1;
}

.header {
  text-align: center;
  margin-bottom: 40px;
  color: white;
}

.header h1 {
  font-size: 2.5rem;
  margin: 0 0 12px 0;
  font-weight: 700;
}

.header p {
  font-size: 1.125rem;
  margin: 0;
  opacity: 0.9;
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
}

.recent-uploads,
.all-files {
  margin-top: 48px;
  padding: 32px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.section-header h2 {
  margin: 0;
  color: #2d3748;
  font-size: 1.5rem;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.view-toggle {
  display: flex;
  gap: 0.5rem;
}

.refresh-icon {
  margin-right: 8px;
}

.uploads-grid,
.files-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.upload-card,
.file-card {
  padding: 20px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
}

.upload-card:hover,
.file-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.upload-info {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 16px;
}

.upload-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.upload-details h3 {
  margin: 0 0 8px 0;
  color: #2d3748;
  font-size: 1.125rem;
  word-break: break-all;
}

.upload-details p {
  margin: 0 0 8px 0;
  color: #718096;
  font-size: 0.875rem;
}

.upload-status.success {
  color: #38a169;
  font-weight: 500;
  font-size: 0.875rem;
}

.upload-actions,
.file-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.file-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.file-thumbnail {
  width: 100%;
  height: 160px;
  border-radius: 8px;
  overflow: hidden;
  background: #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.artwork-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.default-artwork {
  font-size: 3rem;
  color: #a0aec0;
}

.file-info {
  flex: 1;
}

.file-info h3 {
  margin: 0 0 8px 0;
  color: #2d3748;
  font-size: 1.125rem;
}

.file-info p {
  margin: 0 0 8px 0;
  color: #718096;
}

.file-name {
  font-size: 0.75rem;
  color: #a0aec0;
  word-break: break-all;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 0.875rem;
}

.btn-primary {
  background: #4299e1;
  color: white;
}

.btn-primary:hover {
  background: #3182ce;
}

.btn-secondary {
  background: #e2e8f0;
  color: #4a5568;
}

.btn-secondary:hover {
  background: #cbd5e0;
}

.btn-outline {
  background: transparent;
  color: #4299e1;
  border: 1px solid #4299e1;
}

.btn-outline:hover {
  background: #4299e1;
  color: white;
}

.btn-danger {
  background: #e53e3e;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: #c53030;
}

.btn-danger:disabled {
  background: #a0aec0;
  cursor: not-allowed;
  opacity: 0.6;
}
</style>
