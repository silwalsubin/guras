import React from 'react';

interface FontLoaderProps {
  children: React.ReactNode;
}

const FontLoader: React.FC<FontLoaderProps> = ({ children }) => {
  // Since we're using react-native-vector-icons and system fonts,
  // we don't need to load custom fonts asynchronously
  // The fonts are already available through the vector icons package
  return <>{children}</>;
};

export default FontLoader; 