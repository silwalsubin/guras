<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { apiService, type AudioFile } from '@/services/api'

const router = useRouter()
const authStore = useAuthStore()
const audioFiles = ref<AudioFile[]>([])
const isLoading = ref(false)

const loadAudioFiles = async () => {
  isLoading.value = true
  try {
    const response = await apiService.getAudioFiles()
    if (response.data) {
      audioFiles.value = response.data.files
    }
  } catch (error) {
    console.error('Error loading audio files:', error)
  } finally {
    isLoading.value = false
  }
}

const goToUpload = () => {
  if (authStore.isAuthenticated) {
    router.push('/upload')
  } else {
    router.push('/login')
  }
}

onMounted(() => {
  loadAudioFiles()
})
</script>

<template>
  <main class="home-view">
    <div class="hero-section">
      <h1>Welcome to Guras Audio Client</h1>
      <p>Upload and manage your audio files with ease</p>
      <button class="cta-button" @click="goToUpload">
        {{ authStore.isAuthenticated ? 'Start Uploading' : 'Sign In to Upload' }}
      </button>
    </div>

    <div class="stats-section">
      <div class="stat-card">
        <div class="stat-number">{{ audioFiles.length }}</div>
        <div class="stat-label">Audio Files</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ audioFiles.filter(f => f.artworkUrl).length }}</div>
        <div class="stat-label">With Artwork</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">S3</div>
        <div class="stat-label">Cloud Storage</div>
      </div>
    </div>

    <div class="features-section">
      <h2>Features</h2>
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon">📁</div>
          <h3>Drag & Drop Upload</h3>
          <p>Simply drag and drop your audio files and thumbnails to upload them instantly.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">☁️</div>
          <h3>Cloud Storage</h3>
          <p>Files are securely stored in Amazon S3 with automatic backup and redundancy.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🎵</div>
          <h3>Audio Management</h3>
          <p>Organize and manage your audio library with metadata and artwork support.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🔒</div>
          <h3>Secure Access</h3>
          <p>Pre-signed URLs ensure secure access to your files with automatic expiration.</p>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.home-view {
  min-height: 100vh;
  width: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  margin: 0;
  padding: 0;
  flex: 1;
}

.hero-section {
  text-align: center;
  padding: 80px 20px;
  color: white;
}

.hero-section h1 {
  font-size: 3rem;
  margin: 0 0 16px 0;
  font-weight: 700;
}

.hero-section p {
  font-size: 1.25rem;
  margin: 0 0 32px 0;
  opacity: 0.9;
}

.cta-button {
  background: white;
  color: #667eea;
  border: none;
  padding: 16px 32px;
  font-size: 1.125rem;
  font-weight: 600;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.cta-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

.stats-section {
  display: flex;
  justify-content: center;
  gap: 40px;
  padding: 40px 20px;
  flex-wrap: wrap;
}

.stat-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  color: white;
  min-width: 120px;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 0.875rem;
  opacity: 0.8;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.features-section {
  background: white;
  padding: 80px 20px;
}

.features-section h2 {
  text-align: center;
  font-size: 2.5rem;
  margin: 0 0 48px 0;
  color: #2d3748;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 32px;
  max-width: 1200px;
  margin: 0 auto;
}

.feature-card {
  text-align: center;
  padding: 32px 24px;
  border-radius: 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 16px;
}

.feature-card h3 {
  font-size: 1.25rem;
  margin: 0 0 12px 0;
  color: #2d3748;
}

.feature-card p {
  color: #718096;
  line-height: 1.6;
  margin: 0;
}

@media (max-width: 768px) {
  .hero-section h1 {
    font-size: 2rem;
  }

  .stats-section {
    gap: 20px;
  }

  .features-grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }
}
</style>
