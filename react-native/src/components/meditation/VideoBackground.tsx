import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Video from 'react-native-video';

const { width: screenWidth, height: screenHeight } = Dimensions.get('screen');

interface VideoBackgroundProps {
  style?: any;
  videoSource?: any;
  showOverlay?: boolean;
}

const VideoBackground: React.FC<VideoBackgroundProps> = ({
  style,
  videoSource,
  showOverlay = true
}) => {
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<any>(null);

  // Default video source - now we have a real video file
  const defaultVideoSource = videoSource || require('../../../assets/videos/meditation-sky.mp4');

  return (
    <View style={[styles.container, style]}>
      {/* Video Background */}
      {!videoError && defaultVideoSource && (
        <Video
          ref={videoRef}
          source={defaultVideoSource}
          style={styles.video}
          resizeMode="cover"
          repeat={true}
          muted={true}
          playInBackground={false}
          playWhenInactive={false}
          paused={false} // Always keep video playing
          onError={(error) => {
            console.log('🎥 Video error:', error);
            setVideoError(true);
          }}
        />
      )}
      
      {/* Fallback gradient if video fails */}
      {(videoError || !defaultVideoSource) && (
        <View style={styles.fallbackBackground}>
          {/* Animated gradient layers for a more dynamic look */}
          <View style={[styles.gradientLayer, { backgroundColor: '#87CEEB', opacity: 1 }]} />
          <View style={[styles.gradientLayer, { backgroundColor: '#98D8E8', opacity: 0.8 }]} />
          <View style={[styles.gradientLayer, { backgroundColor: '#B0E0E6', opacity: 0.6 }]} />
        </View>
      )}

      {/* Overlay for better text readability */}
      {showOverlay && (
        <View style={styles.overlay} />
      )}
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
  fallbackBackground: {
    flex: 1,
    backgroundColor: '#87CEEB', // Sky blue fallback
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
    backgroundColor: 'rgba(0,0,0,0.1)', // Subtle dark overlay
  },
});

export default VideoBackground;
