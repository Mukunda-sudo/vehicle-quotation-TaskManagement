import React from 'react';
import { ImageBackground, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { theme } from '../core/theme';

export default function Background({ children }) {
  return (
    <ImageBackground
      source={require('../assets/background_dot.png')}  
      resizeMode="repeat"
      style={styles.background}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : null}
      >
        {children}
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    backgroundColor: theme.colors.surface,
  },
  container: {
    flex: 1,
    padding: 20,
    width: '100%',
    maxWidth: 340,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
