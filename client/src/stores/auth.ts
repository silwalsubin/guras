import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService, type AuthUser } from '@/services/auth'
import { useToast } from 'vue-toastification'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<AuthUser | null>(null)
  const isLoading = ref(true)
  const isInitialized = ref(false)

  const toast = useToast()

  // Getters
  const isAuthenticated = computed(() => user.value !== null)
  const userDisplayName = computed(() => user.value?.displayName || user.value?.email || 'User')
  const userEmail = computed(() => user.value?.email)
  const userPhotoURL = computed(() => user.value?.photoURL)

  // Actions
  const initialize = async () => {
    if (isInitialized.value) return

    isLoading.value = true
    
    try {
      // Wait for Firebase auth to initialize
      const currentUser = await authService.waitForAuth()
      user.value = currentUser
      
      // Subscribe to auth state changes
      authService.onAuthStateChange((authUser) => {
        user.value = authUser
        isLoading.value = false
      })
      
      isInitialized.value = true
    } catch (error) {
      console.error('Auth initialization error:', error)
      toast.error('Failed to initialize authentication')
    } finally {
      isLoading.value = false
    }
  }

  const signInWithGoogle = async () => {
    isLoading.value = true
    
    try {
      const result = await authService.signInWithGoogle()
      
      if (result.success && result.user) {
        user.value = result.user
        toast.success(`Welcome, ${result.user.displayName || result.user.email}!`)
        return { success: true }
      } else {
        toast.error(result.error || 'Failed to sign in')
        return { success: false, error: result.error }
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Sign in failed'
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      isLoading.value = false
    }
  }

  const signOut = async () => {
    isLoading.value = true
    
    try {
      const result = await authService.signOutUser()
      
      if (result.success) {
        user.value = null
        toast.success('Signed out successfully')
        return { success: true }
      } else {
        toast.error(result.error || 'Failed to sign out')
        return { success: false, error: result.error }
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Sign out failed'
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      isLoading.value = false
    }
  }

  const getAuthToken = async () => {
    return await authService.getAuthToken()
  }

  const refreshToken = async () => {
    try {
      const token = await authService.getAuthToken()
      return token
    } catch (error) {
      console.error('Token refresh failed:', error)
      return null
    }
  }

  // Initialize auth when store is created
  initialize()

  return {
    // State
    user,
    isLoading,
    isInitialized,
    
    // Getters
    isAuthenticated,
    userDisplayName,
    userEmail,
    userPhotoURL,
    
    // Actions
    initialize,
    signInWithGoogle,
    signOut,
    getAuthToken,
    refreshToken
  }
})
