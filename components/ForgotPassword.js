import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import axios from 'axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  
  const handleForgotPassword = async () => {
    if (email) {
      try {
        const response = await axios.post('http://192.168.1.3:5000/api/users/forgot-password', {
          email,
        });

        // Assuming the response contains a success message
        if (response.status === 200) {
          Alert.alert('Success', 'A password reset link has been sent to your email.');
        }
      } catch (error) {
        Alert.alert('Error', error.response?.data?.message || 'An error occurred');
      }
    } else {
      Alert.alert('Error', 'Please enter your email address');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forgot Password</Text>
      <TextInput 
        style={styles.input} 
        placeholder="Enter your email" 
        value={email} 
        onChangeText={setEmail} 
        autoCapitalize="none" 
      />
      <TouchableOpacity style={styles.button} onPress={handleForgotPassword}>
        <Text style={styles.buttonText}>Send Reset Link</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
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
});

export default ForgotPassword;
