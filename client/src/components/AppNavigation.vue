<template>
  <nav class="app-navigation">
    <div class="nav-container">
      <div class="nav-brand">
        <RouterLink to="/" class="brand-link">
          <img alt="Guras logo" class="logo" src="@/assets/logo.svg" width="32" height="32" />
          <span class="brand-text">Guras</span>
        </RouterLink>
      </div>

      <div class="nav-links">
        <RouterLink to="/" class="nav-link">Home</RouterLink>
        <RouterLink v-if="authStore.isAuthenticated" to="/upload" class="nav-link">Upload</RouterLink>
        <RouterLink to="/about" class="nav-link">About</RouterLink>
      </div>

      <div class="nav-user">
        <div v-if="authStore.isLoading" class="loading-indicator">
          <div class="spinner-small"></div>
        </div>
        
        <div v-else-if="authStore.isAuthenticated" class="user-menu">
          <div class="user-info">
            <img
              v-if="authStore.userPhotoURL"
              :src="authStore.userPhotoURL"
              :alt="authStore.userDisplayName"
              class="user-avatar"
            />
            <div v-else class="user-avatar-placeholder">
              {{ authStore.userDisplayName?.charAt(0).toUpperCase() }}
            </div>
            <span class="user-name">{{ authStore.userDisplayName }}</span>
          </div>
          <button class="sign-out-btn" @click="handleSignOut" title="Sign out">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16,17 21,12 16,7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>

        <div v-else class="auth-actions">
          <RouterLink to="/login" class="sign-in-btn">Sign In</RouterLink>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'vue-toastification'

const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

const handleSignOut = async () => {
  const result = await authStore.signOut()
  if (result.success) {
    router.push('/')
  }
}
</script>

<style scoped>
.app-navigation {
  background: white;
  border-bottom: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
}

.nav-brand {
  display: flex;
  align-items: center;
}

.brand-link {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: #2d3748;
  font-weight: 700;
  font-size: 1.25rem;
}

.brand-link:hover {
  color: #667eea;
}

.logo {
  flex-shrink: 0;
}

.brand-text {
  font-family: 'Inter', sans-serif;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 32px;
}

.nav-link {
  text-decoration: none;
  color: #4a5568;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.nav-link:hover {
  color: #667eea;
  background: #f7fafc;
}

.nav-link.router-link-active {
  color: #667eea;
  background: #ebf8ff;
}

.nav-user {
  display: flex;
  align-items: center;
}

.loading-indicator {
  padding: 8px;
}

.spinner-small {
  width: 20px;
  height: 20px;
  border: 2px solid #e2e8f0;
  border-top: 2px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e2e8f0;
}

.user-avatar-placeholder {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #667eea;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
}

.user-name {
  color: #2d3748;
  font-weight: 500;
  font-size: 0.875rem;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sign-out-btn {
  background: none;
  border: none;
  color: #718096;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sign-out-btn:hover {
  color: #e53e3e;
  background: #fed7d7;
}

.auth-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.sign-in-btn {
  background: #667eea;
  color: white;
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.sign-in-btn:hover {
  background: #5a67d8;
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .nav-container {
    padding: 0 16px;
  }
  
  .nav-links {
    gap: 16px;
  }
  
  .nav-link {
    padding: 6px 12px;
    font-size: 0.875rem;
  }
  
  .user-name {
    display: none;
  }
}

@media (max-width: 640px) {
  .nav-links {
    gap: 8px;
  }
  
  .nav-link {
    padding: 6px 8px;
  }
  
  .brand-text {
    display: none;
  }
}
</style>
