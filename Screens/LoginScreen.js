import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
  LayoutAnimation,
  UIManager,
  Platform,
} from 'react-native';
import { Text } from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Background from '../components/Background';
import Logo from '../components/Logo';
import Button from '../components/Button';
import TextInput from '../components/TextInput';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function LoginScreen({ navigation }) {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const logoScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(logoScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }, []);

  const animateError = (message) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setError(message);
  };

  const handleLogin = async () => {
  if (!userId || !password) return animateError('📧 Please enter User ID and Password');
  if (!/\S+@\S+\.\S+/.test(userId)) return animateError('❌ Invalid email format');

  setLoading(true);
  setError('');

  try {
    const url = `https://script.google.com/macros/s/YOUR_SCRIPT_ID_HERE/exec'?email=${userId}&password=${password}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.success) {
      navigation.navigate('HomeScreen', { userId: data.userId });
    } else {
      animateError(data.message || '🚫 Login failed. Please try again.');
    }
  } catch (err) {
    console.error(err);
    animateError('⚠️ Unable to connect. Try again later.');
  } finally {
    setLoading(false);
  }
};


  return (
    <Background>
      <Animated.View style={{ transform: [{ scale: logoScale }] }}>
        <Logo />
      </Animated.View>

      

      <TextInput
        label="📧 User ID (Email)"
        value={userId}
        onChangeText={(text) => {
          setUserId(text);
          if (error) animateError('');
        }}
        keyboardType="email-address"
        autoCapitalize="none"
        error={!!error}
      />

      <TextInput
        label="🔐 Password"
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          if (error) animateError('');
        }}
        secureTextEntry
        error={!!error}
      />

      <Button mode="contained" onPress={handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : '🚀 Login'}
      </Button>

      {!!error && <Text style={styles.errorText}>{error}</Text>}

      <TouchableOpacity onPress={() => navigation.navigate('SignupScreen')}>
        <Text style={styles.signupText}>🆕 New User? Sign up</Text>
      </TouchableOpacity>
    </Background>
  );
}

const styles = StyleSheet.create({
  shimmerText: {
    marginBottom: 20,
    padding: 5,
    borderRadius: 8,
  },
  header: {
    fontSize: 24,
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  signupText: {
    marginTop: 24,
    fontSize: 14,
    color: '#0066cc',
    textAlign: 'center',
  },
  errorText: {
    color: 'red',
    marginTop: 10,
    fontSize: 13,
    textAlign: 'center',
  },
});
