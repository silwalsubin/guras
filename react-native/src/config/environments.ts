// Environment-specific configurations
interface EnvironmentConfig {
  API_BASE_URL: string;
  ENVIRONMENT: 'development' | 'staging' | 'production';
  DEBUG_MODE: boolean;
  LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error';
}

// Environment configurations
const ENVIRONMENTS: Record<string, EnvironmentConfig> = {
  development: {
    API_BASE_URL: 'http://localhost:5053', // Your local development server
    ENVIRONMENT: 'development',
    DEBUG_MODE: true,
    LOG_LEVEL: 'debug',
  },
  staging: {
    API_BASE_URL: 'http://staging-guras-alb-1230870366.us-east-1.elb.amazonaws.com', // Your staging server
    ENVIRONMENT: 'staging',
    DEBUG_MODE: true,
    LOG_LEVEL: 'info',
  },
  production: {
    API_BASE_URL: 'http://staging-guras-alb-1230870366.us-east-1.elb.amazonaws.com', // Your production server
    ENVIRONMENT: 'production',
    DEBUG_MODE: false,
    LOG_LEVEL: 'warn',
  },
};

// Environment detection logic
const detectEnvironment = (): EnvironmentConfig => {
  // Method 1: Use __DEV__ flag (React Native built-in)
  if (__DEV__) {
    return ENVIRONMENTS.development;
  }

  // Method 2: Check for environment variables (if you set them in build process)
  // You can set these in your CI/CD pipeline or build scripts
  const envFromBuild = process.env.REACT_NATIVE_ENV || process.env.NODE_ENV;
  
  if (envFromBuild && ENVIRONMENTS[envFromBuild]) {
    return ENVIRONMENTS[envFromBuild];
  }

  // Method 3: Check for specific build configurations
  // You can add custom logic here based on your build setup
  
  // Default to production for release builds
  return ENVIRONMENTS.production;
};

export const ENV_CONFIG = detectEnvironment();

// Helper function to get environment-specific config
export const getEnvironmentConfig = (): EnvironmentConfig => ENV_CONFIG;

// Helper function to check if we're in a specific environment
export const isDevelopment = (): boolean => ENV_CONFIG.ENVIRONMENT === 'development';
export const isStaging = (): boolean => ENV_CONFIG.ENVIRONMENT === 'staging';
export const isProduction = (): boolean => ENV_CONFIG.ENVIRONMENT === 'production';

// Log environment info in development
if (__DEV__) {
  console.log('🌍 Environment:', ENV_CONFIG.ENVIRONMENT);
  console.log('🔗 API URL:', ENV_CONFIG.API_BASE_URL);
  console.log('🐛 Debug Mode:', ENV_CONFIG.DEBUG_MODE);
  console.log('📝 Log Level:', ENV_CONFIG.LOG_LEVEL);
} 