import { ENV_CONFIG } from './environments';

// API Configuration
export const API_CONFIG = {
  // Base URL is now environment-aware
  BASE_URL: ENV_CONFIG.API_BASE_URL,
  
  // API endpoints
  ENDPOINTS: {
    PROFILE: '/api/auth/profile',
    QUOTES: '/api/quotes',
    QUOTES_RANDOM: '/api/quotes/random',
    QUOTES_BY_CATEGORY: '/api/quotes/category',
  },
  
  // Request timeout in milliseconds
  TIMEOUT: 10000,
  
  // Environment info
  ENVIRONMENT: ENV_CONFIG.ENVIRONMENT,
  DEBUG_MODE: ENV_CONFIG.DEBUG_MODE,
};