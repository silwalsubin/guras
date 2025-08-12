import React, { createContext, useContext, useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as firebaseSignOut, sendPasswordResetEmail } from '@react-native-firebase/auth';
import type { FirebaseAuthTypes } from '@react-native-firebase/auth';
import authService from '@/services/authService';

interface AuthContextType {
  user: FirebaseAuthTypes.User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  googleSignIn: () => Promise<any>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const auth = getAuth();
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: unknown) {
      let message = 'Unknown error';
      if (error && typeof error === 'object' && 'message' in error && typeof (error as { message?: string }).message === 'string') {
        message = (error as { message: string }).message;
      }
      throw new Error(message);
    }
  };

  const signUp = async (email: string, password: string, name?: string) => {
    try {
      const auth = getAuth();
      // First, create user with Firebase
      await createUserWithEmailAndPassword(auth, email, password);
      
      // After Firebase success, sync with your server
      try {
        await authService.signUp(email, name);
        console.log('User successfully synced with server');
      } catch (serverError) {
        console.warn('Failed to sync with server, but Firebase auth succeeded:', serverError);
        // Re-throw server error so the UI can show it to the user
        throw new Error(`Account created with Firebase but failed to sync with server: ${serverError instanceof Error ? serverError.message : 'Unknown server error'}`);
      }
    } catch (error: unknown) {
      let message = 'Unknown error';
      if (error && typeof error === 'object' && 'message' in error && typeof (error as { message?: string }).message === 'string') {
        message = (error as { message: string }).message;
      }
      throw new Error(message);
    }
  };

  const signOut = async () => {
    try {
      const auth = getAuth();
      await firebaseSignOut(auth);
    } catch (error: unknown) {
      let message = 'Unknown error';
      if (error && typeof error === 'object' && 'message' in error && typeof (error as { message?: string }).message === 'string') {
        message = (error as { message: string }).message;
      }
      throw new Error(message);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const auth = getAuth();
      await sendPasswordResetEmail(auth, email);
    } catch (error: unknown) {
      let message = 'Unknown error';
      if (error && typeof error === 'object' && 'message' in error && typeof (error as { message?: string }).message === 'string') {
        message = (error as { message: string }).message;
      }
      throw new Error(message);
    }
  };

  const googleSignIn = async () => {
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        throw new Error('No authenticated user found');
      }

      const idToken = await currentUser.getIdToken();
      const email = currentUser.email;
      const displayName = currentUser.displayName;
      
      try {
        // Use the authService.googleSignIn method which has the proper logic
        const response = await authService.googleSignIn();
        
        return response;
        
      } catch (error: any) {
        throw error;
      }
    } catch (error) {
      console.error('❌ Google Sign In failed:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Google sign in failed');
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    googleSignIn,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 