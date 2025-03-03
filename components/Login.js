import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useAuth } from '../Auth/AuthContext';

const Login = ({ navigation }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accessToken, setAccessToken] = useState('');

  const handleLogin = async () => {
    if (email && password) {
      try {
        const response = await axios.post('http://172.20.10.4:5000/api/users/login', {
          email,
          password,
        });
        
        const { token, user } = response.data;
  
        if (token) {
          await AsyncStorage.setItem('accessToken', token);
          setAccessToken(token);
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
  
        // Check if the user is an admin or already approved
        if (user.role === 'admin' || user.isApproved) {
          login(user);
          if (response.status === 200) {
            alert('Login successful');
          }
        } else {
          alert('Your account needs approval before you can log in.');
        }
  
      } catch (error) {
        alert(
          'Login failed: ' + (error.response?.data?.message || error.message)
        );
      }
    } else {
      alert('Please enter email and password');
    }
  };
  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>WELCOME TO MWG APP</Text>
      <Text style={styles.title}>Login</Text>

      <TextInput 
        style={styles.input} 
        placeholder="Email" 
        value={email} 
        onChangeText={setEmail} 
        autoCapitalize="none"
      />

      <TextInput 
        style={styles.input} 
        placeholder="Password" 
        value={password} 
        onChangeText={setPassword} 
        secureTextEntry 
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
        <Text style={styles.linkText}>Don't have an account? Sign Up</Text>
      </TouchableOpacity>

      {accessToken ? (
        <Text style={styles.tokenText}>Access Token: {accessToken}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: 20 
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginBottom: 20 
  },
  input: { 
    width: '100%', 
    height: 50, 
    borderColor: '#ccc', 
    borderWidth: 1, 
    borderRadius: 8, 
    paddingHorizontal: 10, 
    marginBottom: 10 
  },
  button: { 
    backgroundColor: '#6200ee', 
    paddingVertical: 12, 
    paddingHorizontal: 20, 
    borderRadius: 8, 
    marginBottom: 10, 
    width: '100%', 
    alignItems: 'center' 
  },
  buttonText: { 
    color: 'white', 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
  linkText: { 
    color: '#6200ee', 
    marginTop: 10 
  },
  tokenText: {
    marginTop: 20,
    fontSize: 12,
    color: 'gray'
  }
});

export default Login;
