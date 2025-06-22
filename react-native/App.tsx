/**
 * Guras React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#000000' : '#FFFFFF',
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <View
          style={{
            backgroundColor: isDarkMode ? '#000000' : '#FFFFFF',
            padding: 20,
          }}>
          <Text style={[styles.title, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
            Welcome to Guras! 🎉
          </Text>
          <Text style={[styles.description, { color: isDarkMode ? '#CCCCCC' : '#333333' }]}>
            This is your React Native app. Edit App.tsx to change this screen and then come back to see your edits.
          </Text>
          <Text style={[styles.subtitle, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
            Getting Started
          </Text>
          <Text style={[styles.description, { color: isDarkMode ? '#CCCCCC' : '#333333' }]}>
            To get started, edit App.tsx and save to reload.
          </Text>
          <Text style={[styles.subtitle, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
            Debug
          </Text>
          <Text style={[styles.description, { color: isDarkMode ? '#CCCCCC' : '#333333' }]}>
            Press Cmd+D in the simulator to open the developer menu.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 10,
  },
});

export default App;
