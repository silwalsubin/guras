import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  type User,
  type UserCredential 
} from 'firebase/auth'
import { auth, googleProvider } from '@/config/firebase'

export interface AuthUser {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  accessToken?: string
}

class AuthService {
  private currentUser: AuthUser | null = null
  private authStateListeners: Array<(user: AuthUser | null) => void> = []

  constructor() {
    // Listen for auth state changes
    onAuthStateChanged(auth, (user) => {
      if (user) {
        this.currentUser = this.mapFirebaseUser(user)
        // Get the ID token for API requests
        user.getIdToken().then(token => {
          if (this.currentUser) {
            this.currentUser.accessToken = token
            localStorage.setItem('authToken', token)
          }
        })
      } else {
        this.currentUser = null
        localStorage.removeItem('authToken')
      }
      
      // Notify all listeners
      this.authStateListeners.forEach(listener => listener(this.currentUser))
    })
  }

  private mapFirebaseUser(user: User): AuthUser {
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
    }
  }

  // Sign in with Google
  async signInWithGoogle(): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
    try {
      const result: UserCredential = await signInWithPopup(auth, googleProvider)
      const user = this.mapFirebaseUser(result.user)
      
      // Get the ID token
      const token = await result.user.getIdToken()
      user.accessToken = token
      localStorage.setItem('authToken', token)
      
      return { success: true, user }
    } catch (error: any) {
      console.error('Google sign-in error:', error)
      return { 
        success: false, 
        error: error.message || 'Failed to sign in with Google' 
      }
    }
  }

  // Sign out
  async signOutUser(): Promise<{ success: boolean; error?: string }> {
    try {
      await signOut(auth)
      localStorage.removeItem('authToken')
      return { success: true }
    } catch (error: any) {
      console.error('Sign out error:', error)
      return { 
        success: false, 
        error: error.message || 'Failed to sign out' 
      }
    }
  }

  // Get current user
  getCurrentUser(): AuthUser | null {
    return this.currentUser
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.currentUser !== null
  }

  // Get current auth token
  async getAuthToken(): Promise<string | null> {
    if (auth.currentUser) {
      try {
        const token = await auth.currentUser.getIdToken(true) // Force refresh
        localStorage.setItem('authToken', token)
        return token
      } catch (error) {
        console.error('Error getting auth token:', error)
        return null
      }
    }
    return localStorage.getItem('authToken')
  }

  // Subscribe to auth state changes
  onAuthStateChange(callback: (user: AuthUser | null) => void): () => void {
    this.authStateListeners.push(callback)
    
    // Return unsubscribe function
    return () => {
      const index = this.authStateListeners.indexOf(callback)
      if (index > -1) {
        this.authStateListeners.splice(index, 1)
      }
    }
  }

  // Wait for auth to be ready
  async waitForAuth(): Promise<AuthUser | null> {
    return new Promise((resolve) => {
      if (auth.currentUser) {
        resolve(this.currentUser)
      } else {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          unsubscribe()
          resolve(user ? this.mapFirebaseUser(user) : null)
        })
      }
    })
  }
}

export const authService = new AuthService()
export default authService
