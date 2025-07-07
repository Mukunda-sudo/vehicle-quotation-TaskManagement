import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
} from 'react-native';
import TextInput from '../components/TextInput';
import Button from '../components/Button';
import DropDownPicker from 'react-native-dropdown-picker';
import LinearGradient from 'react-native-linear-gradient';

export default function SignupScreen({ navigation }) {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([
    { label: 'Pune', value: 'Pune' },
    { label: 'Delhi', value: 'Delhi' },
    { label: 'Rajasthan', value: 'Rajasthan' },
   
  ]);

  const validate = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = 'Required';
    if (!/^\d{10}$/.test(mobile)) newErrors.mobile = '10-digit number';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Invalid email';
    if (!password) newErrors.password = 'Required';
    if (!location) newErrors.location = 'Select location';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    if (message) {
      const timeout = setTimeout(() => setMessage(''), 4000);
      return () => clearTimeout(timeout);
    }
  }, [message]);

  const handleSignup = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch('https://script.google.com/macros/s/YOUR_SCRIPT_ID_HERE/exec', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'signup',
          name,
          mobile,
          email,
          password,
          location,
        }),
      });
      const data = await res.json();
      setLoading(false);
      if (data.success) {
        setMessage(`✅ Account created!`);
        setTimeout(() => navigation.navigate('LoginScreen'), 2000);
      } else {
        setMessage(`❌ ${data.message}`);
      }
    } catch (error) {
      setLoading(false);
      setMessage('❌ Network error.');
    }
  };

  return (
    <LinearGradient colors={['#0f2027', '#203a43', '#2c5364']} style={styles.gradient}>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.container}
        >
          <Text style={styles.header}>✍️ Create Account</Text>

          <View style={styles.card}>
            <TextInput
              label="Full Name"
              value={name}
              onChangeText={text => {
                setName(text);
                if (errors.name) validate();
              }}
              error={!!errors.name}
              errorText={errors.name}
            />
            <TextInput
              label="Mobile"
              keyboardType="numeric"
              value={mobile}
              onChangeText={text => {
                setMobile(text);
                if (errors.mobile) validate();
              }}
              error={!!errors.mobile}
              errorText={errors.mobile}
            />
            <TextInput
              label="Email"
              keyboardType="email-address"
              value={email}
              onChangeText={text => {
                setEmail(text);
                if (errors.email) validate();
              }}
              error={!!errors.email}
              errorText={errors.email}
            />
            <TextInput
              label="Password"
              secureTextEntry
              value={password}
              onChangeText={text => {
                setPassword(text);
                if (errors.password) validate();
              }}
              error={!!errors.password}
              errorText={errors.password}
            />

            <DropDownPicker
              open={open}
              value={location}
              items={items}
              setOpen={setOpen}
              setValue={setLocation}
              setItems={setItems}
              placeholder="📍 Select Location"
              style={styles.dropdown}
              dropDownContainerStyle={{ backgroundColor: '#fff' }}
              onChangeValue={() => errors.location && validate()}
            />
            {!!errors.location && <Text style={styles.errorText}>{errors.location}</Text>}

            {message !== '' && <Text style={styles.message}>{message}</Text>}

            {loading ? (
              <ActivityIndicator size="large" color="#000" style={{ marginTop: 20 }} />
            ) : (
              <TouchableOpacity style={styles.signupBtn} onPress={handleSignup}>
                <Text style={styles.signupText}>🚀 Sign Up</Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity onPress={() => navigation.navigate('LoginScreen')}>
            <Text style={styles.footerText}>
              🔐 Already have an account? <Text style={{ fontWeight: 'bold' }}>Login</Text>
            </Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 24,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    marginBottom: 30,
    zIndex: 999,
  },
  dropdown: {
    marginTop: 10,
    backgroundColor: '#eee',
    borderRadius: 10,
    borderColor: '#ccc',
  },
  errorText: {
    color: 'red',
    marginLeft: 6,
    fontSize: 12,
  },
  message: {
    textAlign: 'center',
    backgroundColor: '#222',
    color: '#fff',
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
  },
  signupBtn: {
    backgroundColor: '#1abc9c',
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 16,
    alignItems: 'center',
  },
  signupText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  footerText: {
    textAlign: 'center',
    color: '#eee',
    fontSize: 14,
    marginTop: 16,
  },
});
