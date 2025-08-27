import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Text,
  ActivityIndicator,
} from 'react-native';
import Video from 'react-native-video';
import { getThemeColors } from '@/config/colors';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

const { width: screenWidth, height: screenHeight } = Dimensions.get('screen');

interface WeatherData {
  condition: 'sunny' | 'cloudy' | 'rainy' | 'foggy' | 'clear';
  isDay: boolean;
  temperature: number;
  location: string;
}

interface WeatherBackgroundProps {
  style?: any;
  showOverlay?: boolean;
}

const WeatherBackground: React.FC<WeatherBackgroundProps> = ({ 
  style, 
  showOverlay = true 
}) => {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const themeColors = getThemeColors(isDarkMode);
  
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [videoError, setVideoError] = useState(false);

  // Get current time to determine day/night
  const getCurrentTimeInfo = () => {
    const now = new Date();
    const hour = now.getHours();
    const isDay = hour >= 6 && hour < 18; // 6 AM to 6 PM is day
    return { hour, isDay };
  };

  // Mock weather data - replace with real API call later
  const fetchWeatherData = async () => {
    try {
      setLoading(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const { isDay } = getCurrentTimeInfo();
      
      // Mock weather conditions based on time
      const conditions: WeatherData['condition'][] = ['sunny', 'cloudy', 'rainy', 'foggy', 'clear'];
      const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
      
      const mockWeather: WeatherData = {
        condition: isDay ? (randomCondition === 'clear' ? 'sunny' : randomCondition) : 'clear',
        isDay,
        temperature: Math.floor(Math.random() * 30) + 10, // 10-40°C
        location: 'Current Location'
      };
      
      setWeatherData(mockWeather);
      console.log('🌤️ Weather data loaded:', mockWeather);
    } catch (error) {
      console.error('🌤️ Failed to fetch weather:', error);
      // Fallback weather
      const { isDay } = getCurrentTimeInfo();
      setWeatherData({
        condition: isDay ? 'sunny' : 'clear',
        isDay,
        temperature: 22,
        location: 'Unknown'
      });
    } finally {
      setLoading(false);
    }
  };

  // Get video source based on weather condition
  const getVideoSource = (weather: WeatherData) => {
    // For now, we'll use a placeholder or fallback to gradient
    // Later you can add actual video files here
    const videoMap = {
      'sunny-day': require('@/assets/videos/meditation-sky.mp4'),
      'cloudy-day': require('@/assets/videos/meditation-sky.mp4'),
      'rainy-day': require('@/assets/videos/meditation-sky.mp4'),
      'foggy-day': require('@/assets/videos/meditation-sky.mp4'),
      'clear-night': require('@/assets/videos/meditation-sky.mp4'),
      'cloudy-night': require('@/assets/videos/meditation-sky.mp4'),
      'rainy-night': require('@/assets/videos/meditation-sky.mp4'),
      'foggy-night': require('@/assets/videos/meditation-sky.mp4'),
    };

    const key = `${weather.condition}-${weather.isDay ? 'day' : 'night'}` as keyof typeof videoMap;
    return videoMap[key] || videoMap['sunny-day'];
  };

  // Get gradient colors as fallback
  const getGradientColors = (weather: WeatherData) => {
    if (weather.isDay) {
      switch (weather.condition) {
        case 'sunny':
          return ['#87CEEB', '#98D8E8', '#B0E0E6'];
        case 'cloudy':
          return ['#B0C4DE', '#D3D3D3', '#E6E6FA'];
        case 'rainy':
          return ['#708090', '#778899', '#B0C4DE'];
        case 'foggy':
          return ['#F5F5F5', '#E0E0E0', '#D3D3D3'];
        default:
          return ['#87CEEB', '#98D8E8', '#B0E0E6'];
      }
    } else {
      switch (weather.condition) {
        case 'clear':
          return ['#191970', '#000080', '#4B0082'];
        case 'cloudy':
          return ['#2F4F4F', '#36454F', '#4A4A4A'];
        case 'rainy':
          return ['#1C1C1C', '#2F2F2F', '#404040'];
        case 'foggy':
          return ['#36454F', '#4A4A4A', '#5D5D5D'];
        default:
          return ['#191970', '#000080', '#4B0082'];
      }
    }
  };

  useEffect(() => {
    fetchWeatherData();
    
    // Refresh weather data every 30 minutes
    const interval = setInterval(fetchWeatherData, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, style]}>
        <View style={[styles.gradientFallback, { 
          backgroundColor: themeColors.background 
        }]}>
          <ActivityIndicator size="large" color={themeColors.textSecondary} />
          <Text style={[styles.loadingText, { color: themeColors.textSecondary }]}>
            Loading ambient background...
          </Text>
        </View>
      </View>
    );
  }

  if (!weatherData) {
    return (
      <View style={[styles.container, style]}>
        <View style={[styles.gradientFallback, { 
          backgroundColor: themeColors.background 
        }]} />
      </View>
    );
  }

  const gradientColors = getGradientColors(weatherData);

  return (
    <View style={[styles.container, style]}>
      {/* Video Background */}
      {!videoError && (
        <Video
          source={getVideoSource(weatherData)}
          style={styles.video}
          resizeMode="cover"
          repeat={true}
          muted={true}
          playInBackground={false}
          playWhenInactive={false}
          onError={(error) => {
            console.log('🎥 Video error:', error);
            setVideoError(true);
          }}
        />
      )}
      
      {/* Gradient Fallback */}
      {videoError && (
        <View style={[
          styles.gradientFallback,
          {
            backgroundColor: gradientColors[0],
            // Simple gradient effect using opacity layers
          }
        ]}>
          <View style={[
            styles.gradientLayer,
            { backgroundColor: gradientColors[1], opacity: 0.7 }
          ]} />
          <View style={[
            styles.gradientLayer,
            { backgroundColor: gradientColors[2], opacity: 0.4 }
          ]} />
        </View>
      )}

      {/* Overlay for better text readability */}
      {showOverlay && (
        <View style={[
          styles.overlay,
          { backgroundColor: weatherData.isDay ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.2)' }
        ]} />
      )}

      {/* Weather Info (optional, can be hidden) */}
      <View style={styles.weatherInfo}>
        <Text style={[styles.weatherText, { 
          color: weatherData.isDay ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.6)' 
        }]}>
          {weatherData.temperature}°C • {weatherData.condition}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: -100, // Extend well above the status bar
    left: 0,
    right: 0,
    bottom: 0,
    width: screenWidth,
    height: screenHeight + 100, // Add extra height to cover status bar
    zIndex: -1, // Ensure it stays behind content
  },
  video: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: screenWidth,
    height: screenHeight + 100, // Add extra height to cover status bar
  },
  gradientFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradientLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: screenWidth,
    height: screenHeight + 100,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: screenWidth,
    height: screenHeight + 100,
  },
  weatherInfo: {
    position: 'absolute',
    top: 60,
    right: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backdropFilter: 'blur(10px)',
  },
  weatherText: {
    fontSize: 12,
    fontWeight: '500',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    textAlign: 'center',
  },
});

export default WeatherBackground;
