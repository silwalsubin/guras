<template>
  <div class="file-upload-container">
    <div
      class="drop-zone"
      :class="{
        'drag-over': isDragOver,
        'uploading': isUploading
      }"
      @drop="handleDrop"
      @dragover="handleDragOver"
      @dragenter="handleDragEnter"
      @dragleave="handleDragLeave"
      @click="openFileDialog"
    >
      <div v-if="!isUploading" class="drop-zone-content">
        <div class="upload-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7,10 12,15 17,10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
        </div>
        <h3>Drop your audio files here</h3>
        <p>or click to browse files</p>
        <div class="supported-formats">
          <span>Supported formats: MP3, WAV, M4A, AAC, OGG, FLAC</span>
        </div>
      </div>

      <div v-else class="uploading-content">
        <div class="spinner"></div>
        <h3>Uploading files...</h3>
        <div class="progress-info">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: `${uploadProgress}%` }"></div>
          </div>
          <span class="progress-text">{{ uploadProgress }}%</span>
        </div>
      </div>
    </div>

    <!-- File input (hidden) -->
    <input
      ref="fileInput"
      type="file"
      multiple
      accept="audio/*,image/*"
      style="display: none"
      @change="handleFileSelect"
    />

    <!-- Selected Files Preview -->
    <div v-if="selectedFiles.length > 0 && !isUploading" class="selected-files">
      <h4>Selected Files ({{ selectedFiles.length }})</h4>
      <div class="file-list">
        <div
          v-for="(fileGroup, index) in fileGroups"
          :key="index"
          class="file-group"
        >
          <div class="audio-file">
            <div class="file-icon">🎵</div>
            <div class="file-info">
              <span class="file-name">{{ fileGroup.audio.name }}</span>
              <span class="file-size">{{ formatFileSize(fileGroup.audio.size) }}</span>
            </div>
          </div>
          <div v-if="fileGroup.thumbnail" class="thumbnail-file">
            <div class="file-icon">🖼️</div>
            <div class="file-info">
              <span class="file-name">{{ fileGroup.thumbnail.name }}</span>
              <span class="file-size">{{ formatFileSize(fileGroup.thumbnail.size) }}</span>
            </div>
            <img
              :src="fileGroup.thumbnailPreview"
              alt="Thumbnail preview"
              class="thumbnail-preview"
            />
          </div>
          <button
            class="remove-file"
            @click="removeFileGroup(index)"
            title="Remove files"
          >
            ×
          </button>
        </div>
      </div>
      <div class="upload-actions">
        <button class="btn btn-secondary" @click="clearFiles">Clear All</button>
        <button class="btn btn-primary" @click="uploadFiles">Upload Files</button>
      </div>
    </div>

    <!-- Upload Results -->
    <div v-if="uploadResults.length > 0" class="upload-results">
      <h4>Upload Results</h4>
      <div class="results-list">
        <div
          v-for="(result, index) in uploadResults"
          :key="index"
          class="result-item"
          :class="{ success: result.success, error: !result.success }"
        >
          <span class="result-icon">{{ result.success ? '✅' : '❌' }}</span>
          <span class="result-text">
            {{ result.success ? `Uploaded: ${result.audioFileName}` : `Failed: ${result.error}` }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useToast } from 'vue-toastification'
import { apiService } from '@/services/api'

// Props and emits
const emit = defineEmits<{
  uploadComplete: [results: any[]]
}>()

// Reactive state
const isDragOver = ref(false)
const isUploading = ref(false)
const uploadProgress = ref(0)
const selectedFiles = ref<File[]>([])
const uploadResults = ref<any[]>([])
const fileInput = ref<HTMLInputElement>()

const toast = useToast()

// Computed properties
const fileGroups = computed(() => {
  const groups: Array<{
    audio: File
    thumbnail?: File
    thumbnailPreview?: string
  }> = []

  const audioFiles = selectedFiles.value.filter(file => file.type.startsWith('audio/'))
  const imageFiles = selectedFiles.value.filter(file => file.type.startsWith('image/'))

  audioFiles.forEach(audioFile => {
    const baseName = audioFile.name.replace(/\.[^/.]+$/, '')
    const matchingThumbnail = imageFiles.find(img => {
      const imgBaseName = img.name.replace(/\.[^/.]+$/, '')
      return imgBaseName === baseName || img.name.includes(baseName)
    })

    const group: any = { audio: audioFile }
    
    if (matchingThumbnail) {
      group.thumbnail = matchingThumbnail
      group.thumbnailPreview = URL.createObjectURL(matchingThumbnail)
    }

    groups.push(group)
  })

  return groups
})

// Methods
const handleDragOver = (e: DragEvent) => {
  e.preventDefault()
  isDragOver.value = true
}

const handleDragEnter = (e: DragEvent) => {
  e.preventDefault()
  isDragOver.value = true
}

const handleDragLeave = (e: DragEvent) => {
  e.preventDefault()
  if (!e.relatedTarget || !(e.currentTarget as Element).contains(e.relatedTarget as Node)) {
    isDragOver.value = false
  }
}

const handleDrop = (e: DragEvent) => {
  e.preventDefault()
  isDragOver.value = false
  
  const files = Array.from(e.dataTransfer?.files || [])
  processFiles(files)
}

const openFileDialog = () => {
  fileInput.value?.click()
}

const handleFileSelect = (e: Event) => {
  const target = e.target as HTMLInputElement
  const files = Array.from(target.files || [])
  processFiles(files)
}

const processFiles = (files: File[]) => {
  const validFiles = files.filter(file => {
    return file.type.startsWith('audio/') || file.type.startsWith('image/')
  })

  if (validFiles.length !== files.length) {
    toast.warning('Some files were skipped. Only audio and image files are supported.')
  }

  selectedFiles.value = [...selectedFiles.value, ...validFiles]
  
  if (validFiles.length > 0) {
    toast.success(`Added ${validFiles.length} file(s)`)
  }
}

const removeFileGroup = (index: number) => {
  const group = fileGroups.value[index]
  selectedFiles.value = selectedFiles.value.filter(file => 
    file !== group.audio && file !== group.thumbnail
  )
}

const clearFiles = () => {
  selectedFiles.value = []
  uploadResults.value = []
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const uploadFiles = async () => {
  if (fileGroups.value.length === 0) return

  isUploading.value = true
  uploadProgress.value = 0
  uploadResults.value = []

  const totalGroups = fileGroups.value.length
  let completedGroups = 0

  for (const group of fileGroups.value) {
    try {
      const result = await apiService.uploadAudioWithThumbnail(group.audio, group.thumbnail)
      uploadResults.value.push(result)
      
      completedGroups++
      uploadProgress.value = Math.round((completedGroups / totalGroups) * 100)
      
      if (result.success) {
        toast.success(`Uploaded: ${group.audio.name}`)
      } else {
        toast.error(`Failed to upload: ${group.audio.name}`)
      }
    } catch (error: any) {
      uploadResults.value.push({
        success: false,
        error: error.message || 'Upload failed'
      })
      toast.error(`Error uploading: ${group.audio.name}`)
    }
  }

  isUploading.value = false
  emit('uploadComplete', uploadResults.value)
  
  // Clear files after successful upload
  const successfulUploads = uploadResults.value.filter(r => r.success)
  if (successfulUploads.length > 0) {
    setTimeout(() => {
      selectedFiles.value = []
    }, 2000)
  }
}
</script>

<style scoped>
.file-upload-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.drop-zone {
  border: 2px dashed #cbd5e0;
  border-radius: 12px;
  padding: 60px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #f8fafc;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.drop-zone:hover {
  border-color: #4299e1;
  background: #ebf8ff;
}

.drop-zone.drag-over {
  border-color: #3182ce;
  background: #bee3f8;
  transform: scale(1.02);
}

.drop-zone.uploading {
  border-color: #38a169;
  background: #f0fff4;
}

.drop-zone-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.upload-icon {
  color: #4a5568;
  opacity: 0.7;
}

.drop-zone h3 {
  margin: 0;
  color: #2d3748;
  font-size: 1.5rem;
  font-weight: 600;
}

.drop-zone p {
  margin: 0;
  color: #718096;
  font-size: 1rem;
}

.supported-formats {
  margin-top: 8px;
}

.supported-formats span {
  color: #a0aec0;
  font-size: 0.875rem;
}

.uploading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e2e8f0;
  border-top: 4px solid #4299e1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.progress-info {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  max-width: 300px;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #4299e1;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.875rem;
  color: #4a5568;
  min-width: 40px;
}

.selected-files {
  margin-top: 32px;
  padding: 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.selected-files h4 {
  margin: 0 0 16px 0;
  color: #2d3748;
  font-size: 1.25rem;
}

.file-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.file-group {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  position: relative;
}

.audio-file,
.thumbnail-file {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.file-icon {
  font-size: 1.5rem;
}

.file-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.file-name {
  font-weight: 500;
  color: #2d3748;
}

.file-size {
  font-size: 0.875rem;
  color: #718096;
}

.thumbnail-preview {
  width: 48px;
  height: 48px;
  object-fit: cover;
  border-radius: 6px;
  border: 2px solid #e2e8f0;
}

.remove-file {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  border: none;
  background: #e53e3e;
  color: white;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  line-height: 1;
}

.remove-file:hover {
  background: #c53030;
}

.upload-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary {
  background: #e2e8f0;
  color: #4a5568;
}

.btn-secondary:hover {
  background: #cbd5e0;
}

.btn-primary {
  background: #4299e1;
  color: white;
}

.btn-primary:hover {
  background: #3182ce;
}

.upload-results {
  margin-top: 32px;
  padding: 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.upload-results h4 {
  margin: 0 0 16px 0;
  color: #2d3748;
  font-size: 1.25rem;
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.result-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 6px;
}

.result-item.success {
  background: #f0fff4;
  border: 1px solid #9ae6b4;
}

.result-item.error {
  background: #fed7d7;
  border: 1px solid #feb2b2;
}

.result-icon {
  font-size: 1.25rem;
}

.result-text {
  color: #2d3748;
  font-weight: 500;
}
</style>
