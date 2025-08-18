// Environment-specific configurations
// ⚠️  TEMPORARY OVERRIDE: App is currently forced to use STAGING environment
//     Remove the override in detectEnvironment() function when done testing
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
    API_BASE_URL: 'https://staging.gurasuniverse.com', // Your staging server
    ENVIRONMENT: 'staging',
    DEBUG_MODE: true,
    LOG_LEVEL: 'info',
  },
  production: {
    API_BASE_URL: 'https://staging.gurasuniverse.com', // Your production server (using staging for now)
    ENVIRONMENT: 'production',
    DEBUG_MODE: false,
    LOG_LEVEL: 'warn',
  },
};

// Environment detection logic
const detectEnvironment = (): EnvironmentConfig => {
  // TEMPORARY: Force staging environment to reproduce TestFlight issues
  // TODO: Remove this override after debugging network issues
  return ENVIRONMENTS.staging;

  // Method 1: Use __DEV__ flag (React Native built-in)
  // if (__DEV__) {
  //   return ENVIRONMENTS.development;
  // }

  // Method 2: Check for environment variables (if you set them in build process)
  // You can set these in your CI/CD pipeline or build scripts
  // const envFromBuild = process.env.REACT_NATIVE_ENV || process.env.NODE_ENV;

  // if (envFromBuild && ENVIRONMENTS[envFromBuild]) {
  //   return ENVIRONMENTS[envFromBuild];
  // }

  // Method 3: Check for specific build configurations
  // You can add custom logic here based on your build setup

  // Default to staging for release builds (TestFlight, App Store)
  // Change this to 'production' when you have a production server ready
  // return ENVIRONMENTS.staging;
};

export const ENV_CONFIG = detectEnvironment();

// Helper function to get environment-specific config
export const getEnvironmentConfig = (): EnvironmentConfig => ENV_CONFIG;

// Helper function to check if we're in a specific environment
export const isDevelopment = (): boolean => ENV_CONFIG.ENVIRONMENT === 'development';
export const isStaging = (): boolean => ENV_CONFIG.ENVIRONMENT === 'staging';
export const isProduction = (): boolean => ENV_CONFIG.ENVIRONMENT === 'production';

// Log environment info (always log for debugging network issues)
console.log('🌍 Environment:', ENV_CONFIG.ENVIRONMENT);
console.log('🔗 API URL:', ENV_CONFIG.API_BASE_URL);
console.log('🐛 Debug Mode:', ENV_CONFIG.DEBUG_MODE);
console.log('📝 Log Level:', ENV_CONFIG.LOG_LEVEL);
console.log('🔍 __DEV__ flag:', __DEV__);