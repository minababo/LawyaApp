import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  TextInput,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { api } from '@/lib/api';
import * as SecureStore from 'expo-secure-store';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setError('');

    try {
      const res = await api.post('users/login/', { email, password });
      const token = res.data.token;

      await SecureStore.setItemAsync('authToken', token);

      const userDetails = await api.get('users/me/', {
        headers: { Authorization: `Token ${token}` },
      });

      const role = userDetails.data.role;
      await SecureStore.setItemAsync('userRole', role);

      Alert.alert('Login Successful', 'Redirecting...');

      if (role === 'client') {
        router.replace('/dashboard-client');
      } else if (role === 'lawyer') {
        router.replace('/dashboard-lawyer');
      } else {
        Alert.alert('Unknown Role', 'User role is not recognized');
      }
    } catch (err: any) {
      console.error('Login error:', err.response?.data || err.message);
      setError('Invalid email or password');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Image source={require('@/assets/images/lawyalogo.png')} style={styles.logo} />
        <Text style={styles.title}>Welcome to Lawya</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#999"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Pressable style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </Pressable>

        <View style={styles.signupRow}>
          <Text style={styles.signupText}>Don’t have an account?</Text>
          <Pressable onPress={() => router.push('/(auth)/account-type')}>
            <Text style={styles.signupLink}>Sign up</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 110,
    height: 110,
    marginBottom: 20,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  input: {
    width: '100%',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#AFA2A2',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  error: {
    color: '#e74c3c',
    marginBottom: 10,
    fontSize: 14,
  },
  signupRow: {
    flexDirection: 'row',
    marginTop: 20,
    alignItems: 'center',
  },
  signupText: {
    fontSize: 14,
    color: '#444',
  },
  signupLink: {
    fontSize: 14,
    color: '#2E86C1',
    fontWeight: '600',
    marginLeft: 5,
  },
});