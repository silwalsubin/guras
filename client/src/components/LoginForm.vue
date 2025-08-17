<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h1>Welcome to Guras</h1>
        <p>Sign in to upload and manage your audio files</p>
      </div>

      <div class="login-content">
        <div v-if="isLoading" class="loading-state">
          <div class="spinner"></div>
          <p>Signing you in...</p>
        </div>

        <div v-else class="login-form">
          <button
            class="google-signin-btn"
            @click="handleGoogleSignIn"
            :disabled="isLoading"
          >
            <svg class="google-icon" viewBox="0 0 24 24" width="20" height="20">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <div class="divider">
            <span>or</span>
          </div>

          <div class="demo-info">
            <div class="info-card">
              <h3>🎵 Audio Upload</h3>
              <p>Upload your audio files with drag & drop</p>
            </div>
            <div class="info-card">
              <h3>☁️ Cloud Storage</h3>
              <p>Secure storage with Amazon S3</p>
            </div>
            <div class="info-card">
              <h3>🖼️ Thumbnails</h3>
              <p>Add artwork to your audio files</p>
            </div>
          </div>
        </div>
      </div>

      <div class="login-footer">
        <p>By signing in, you agree to our terms of service and privacy policy.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'vue-toastification'

const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

const isLoading = ref(false)

const handleGoogleSignIn = async () => {
  isLoading.value = true
  
  try {
    const result = await authStore.signInWithGoogle()
    
    if (result.success) {
      // Redirect to upload page after successful login
      router.push('/upload')
    }
  } catch (error: any) {
    toast.error('Sign in failed: ' + error.message)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  margin: 0;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
}

.login-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  max-width: 480px;
  width: 100%;
  overflow: hidden;
}

.login-header {
  text-align: center;
  padding: 40px 40px 20px 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.login-header h1 {
  margin: 0 0 12px 0;
  font-size: 2rem;
  font-weight: 700;
}

.login-header p {
  margin: 0;
  opacity: 0.9;
  font-size: 1.125rem;
}

.login-content {
  padding: 40px;
}

.loading-state {
  text-align: center;
  padding: 40px 0;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e2e8f0;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.google-signin-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
  padding: 16px 24px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  background: white;
  color: #2d3748;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.google-signin-btn:hover {
  border-color: #cbd5e0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.google-signin-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.google-icon {
  flex-shrink: 0;
}

.divider {
  text-align: center;
  position: relative;
  margin: 8px 0;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: #e2e8f0;
}

.divider span {
  background: white;
  padding: 0 16px;
  color: #a0aec0;
  font-size: 0.875rem;
}

.demo-info {
  display: grid;
  gap: 16px;
}

.info-card {
  padding: 20px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  text-align: center;
}

.info-card h3 {
  margin: 0 0 8px 0;
  color: #2d3748;
  font-size: 1.125rem;
}

.info-card p {
  margin: 0;
  color: #718096;
  font-size: 0.875rem;
}

.login-footer {
  padding: 20px 40px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  text-align: center;
}

.login-footer p {
  margin: 0;
  color: #718096;
  font-size: 0.75rem;
  line-height: 1.5;
}

@media (max-width: 640px) {
  .login-card {
    margin: 0;
    border-radius: 0;
    min-height: 100vh;
  }
  
  .login-header,
  .login-content,
  .login-footer {
    padding-left: 20px;
    padding-right: 20px;
  }
}
</style>
