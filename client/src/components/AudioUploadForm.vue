<template>
  <div class="audio-upload-form">
    <!-- Metadata Form -->
    <div class="metadata-section">
      <h3>Audio Information</h3>
      <div class="form-group">
        <label for="name">Title *</label>
        <input
          id="name"
          v-model="metadata.name"
          type="text"
          placeholder="Enter audio title"
          required
        />
      </div>
      <div class="form-group">
        <label for="author">Artist/Author *</label>
        <input
          id="author"
          v-model="metadata.author"
          type="text"
          placeholder="Enter artist or author name"
          required
        />
      </div>
      <div class="form-group">
        <label for="description">Description</label>
        <textarea
          id="description"
          v-model="metadata.description"
          placeholder="Enter description (optional)"
          rows="3"
        ></textarea>
      </div>
    </div>

    <!-- Audio File Upload -->
    <div class="upload-section">
      <h3>Audio File *</h3>
      <div
        class="drop-zone audio-drop-zone"
        :class="{ 'drag-over': isAudioDragOver, 'has-file': audioFile }"
        @drop="handleAudioDrop"
        @dragover="handleAudioDragOver"
        @dragenter="handleAudioDragEnter"
        @dragleave="handleAudioDragLeave"
        @click="openAudioFileDialog"
      >
        <div v-if="!audioFile" class="drop-zone-content">
          <div class="upload-icon">🎵</div>
          <p>Drop audio file here or click to browse</p>
          <span class="supported-formats">MP3, WAV, M4A, AAC, OGG, FLAC</span>
        </div>
        <div v-else class="file-info">
          <div class="file-icon">🎵</div>
          <div class="file-details">
            <p class="file-name">{{ audioFile.name }}</p>
            <p class="file-size">{{ formatFileSize(audioFile.size) }}</p>
          </div>
          <button @click.stop="removeAudioFile" class="remove-btn">×</button>
        </div>
      </div>
      <input
        ref="audioFileInput"
        type="file"
        accept="audio/*"
        style="display: none"
        @change="handleAudioFileSelect"
      />
    </div>

    <!-- Thumbnail Upload -->
    <div class="upload-section">
      <h3>Thumbnail Image *</h3>
      <div
        class="drop-zone thumbnail-drop-zone"
        :class="{ 'drag-over': isThumbnailDragOver, 'has-file': thumbnailFile }"
        @drop="handleThumbnailDrop"
        @dragover="handleThumbnailDragOver"
        @dragenter="handleThumbnailDragEnter"
        @dragleave="handleThumbnailDragLeave"
        @click="openThumbnailFileDialog"
      >
        <div v-if="!thumbnailFile" class="drop-zone-content">
          <div class="upload-icon">🖼️</div>
          <p>Drop thumbnail image here or click to browse</p>
          <span class="supported-formats">JPG, PNG, GIF, WebP</span>
        </div>
        <div v-else class="file-info">
          <div class="file-preview">
            <img :src="thumbnailPreview" alt="Thumbnail preview" />
          </div>
          <div class="file-details">
            <p class="file-name">{{ thumbnailFile.name }}</p>
            <p class="file-size">{{ formatFileSize(thumbnailFile.size) }}</p>
          </div>
          <button @click.stop="removeThumbnailFile" class="remove-btn">×</button>
        </div>
      </div>
      <input
        ref="thumbnailFileInput"
        type="file"
        accept="image/*"
        style="display: none"
        @change="handleThumbnailFileSelect"
      />
    </div>

    <!-- Upload Button -->
    <div class="upload-actions">
      <button
        class="upload-btn"
        :disabled="!canUpload || isUploading"
        @click="uploadFiles"
      >
        <span v-if="!isUploading">Upload Audio</span>
        <span v-else>Uploading... {{ uploadProgress }}%</span>
      </button>
    </div>

    <!-- Progress Bar -->
    <div v-if="isUploading" class="progress-section">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: `${uploadProgress}%` }"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useToast } from 'vue-toastification'
import { apiService } from '@/services/api'

const toast = useToast()

// Reactive data
const metadata = ref({
  name: '',
  author: '',
  description: ''
})

const audioFile = ref<File | null>(null)
const thumbnailFile = ref<File | null>(null)
const thumbnailPreview = ref<string>('')

const isAudioDragOver = ref(false)
const isThumbnailDragOver = ref(false)
const isUploading = ref(false)
const uploadProgress = ref(0)

// Refs for file inputs
const audioFileInput = ref<HTMLInputElement>()
const thumbnailFileInput = ref<HTMLInputElement>()

// Computed
const canUpload = computed(() => {
  return metadata.value.name.trim() !== '' &&
         metadata.value.author.trim() !== '' &&
         audioFile.value !== null &&
         thumbnailFile.value !== null
})

// Emit events
const emit = defineEmits<{
  uploadSuccess: [audioFileId: string]
  uploadError: [error: string]
}>()

// Audio file handling
const openAudioFileDialog = () => {
  audioFileInput.value?.click()
}

const handleAudioFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (files && files.length > 0) {
    setAudioFile(files[0])
  }
}

const handleAudioDrop = (event: DragEvent) => {
  event.preventDefault()
  isAudioDragOver.value = false
  
  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    const file = files[0]
    if (file.type.startsWith('audio/')) {
      setAudioFile(file)
    } else {
      toast.error('Please select an audio file')
    }
  }
}

const setAudioFile = (file: File) => {
  audioFile.value = file
  // Auto-fill title if empty
  if (!metadata.value.name) {
    metadata.value.name = file.name.replace(/\.[^/.]+$/, '')
  }
}

const removeAudioFile = () => {
  audioFile.value = null
}

// Thumbnail file handling
const openThumbnailFileDialog = () => {
  thumbnailFileInput.value?.click()
}

const handleThumbnailFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (files && files.length > 0) {
    setThumbnailFile(files[0])
  }
}

const handleThumbnailDrop = (event: DragEvent) => {
  event.preventDefault()
  isThumbnailDragOver.value = false
  
  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    const file = files[0]
    if (file.type.startsWith('image/')) {
      setThumbnailFile(file)
    } else {
      toast.error('Please select an image file')
    }
  }
}

const setThumbnailFile = (file: File) => {
  thumbnailFile.value = file
  
  // Create preview
  const reader = new FileReader()
  reader.onload = (e) => {
    thumbnailPreview.value = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

const removeThumbnailFile = () => {
  thumbnailFile.value = null
  thumbnailPreview.value = ''
}

// Drag and drop handlers
const handleAudioDragOver = (event: DragEvent) => {
  event.preventDefault()
  isAudioDragOver.value = true
}

const handleAudioDragEnter = (event: DragEvent) => {
  event.preventDefault()
  isAudioDragOver.value = true
}

const handleAudioDragLeave = (event: DragEvent) => {
  event.preventDefault()
  isAudioDragOver.value = false
}

const handleThumbnailDragOver = (event: DragEvent) => {
  event.preventDefault()
  isThumbnailDragOver.value = true
}

const handleThumbnailDragEnter = (event: DragEvent) => {
  event.preventDefault()
  isThumbnailDragOver.value = true
}

const handleThumbnailDragLeave = (event: DragEvent) => {
  event.preventDefault()
  isThumbnailDragOver.value = false
}

// Upload functionality
const uploadFiles = async () => {
  if (!canUpload.value) return

  isUploading.value = true
  uploadProgress.value = 0

  try {
    // Simulate progress
    const progressInterval = setInterval(() => {
      if (uploadProgress.value < 90) {
        uploadProgress.value += 10
      }
    }, 200)

    const result = await apiService.uploadAudioWithThumbnail(
      audioFile.value!,
      thumbnailFile.value!,
      metadata.value
    )

    clearInterval(progressInterval)
    uploadProgress.value = 100

    if (result.success && result.audioFileId) {
      toast.success('Audio uploaded successfully!')
      emit('uploadSuccess', result.audioFileId)
      resetForm()
    } else {
      toast.error(result.error || 'Upload failed')
      emit('uploadError', result.error || 'Upload failed')
    }
  } catch (error: any) {
    toast.error('Upload failed: ' + error.message)
    emit('uploadError', error.message)
  } finally {
    isUploading.value = false
    uploadProgress.value = 0
  }
}

const resetForm = () => {
  metadata.value = { name: '', author: '', description: '' }
  audioFile.value = null
  thumbnailFile.value = null
  thumbnailPreview.value = ''
}

// Utility functions
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>

<style scoped>
.audio-upload-form {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.metadata-section {
  margin-bottom: 2rem;
}

.metadata-section h3 {
  margin-bottom: 1rem;
  color: #333;
  font-size: 1.2rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #555;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
}

.upload-section {
  margin-bottom: 2rem;
}

.upload-section h3 {
  margin-bottom: 1rem;
  color: #333;
  font-size: 1.2rem;
}

.drop-zone {
  border: 2px dashed #cbd5e0;
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #f8fafc;
}

.drop-zone:hover {
  border-color: #667eea;
  background: #f0f4ff;
}

.drop-zone.drag-over {
  border-color: #667eea;
  background: #e6f3ff;
  transform: scale(1.02);
}

.drop-zone.has-file {
  border-color: #48bb78;
  background: #f0fff4;
}

.drop-zone-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.upload-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.supported-formats {
  font-size: 0.875rem;
  color: #718096;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  text-align: left;
}

.file-icon {
  font-size: 2rem;
}

.file-preview {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
}

.file-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.file-details {
  flex: 1;
}

.file-name {
  font-weight: 500;
  margin: 0 0 0.25rem 0;
}

.file-size {
  font-size: 0.875rem;
  color: #718096;
  margin: 0;
}

.remove-btn {
  background: #e53e3e;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-btn:hover {
  background: #c53030;
}

.upload-actions {
  margin-bottom: 1rem;
}

.upload-btn {
  width: 100%;
  padding: 1rem 2rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.upload-btn:hover:not(:disabled) {
  background: #5a67d8;
}

.upload-btn:disabled {
  background: #a0aec0;
  cursor: not-allowed;
}

.progress-section {
  margin-top: 1rem;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #48bb78;
  transition: width 0.3s ease;
}
</style>
