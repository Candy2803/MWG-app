import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import axios from 'axios';

const ResetPassword = ({ route }) => {
  const { token } = route.params; // Get the token from URL parameters
  const [newPassword, setNewPassword] = useState('');

  const handleResetPassword = async () => {
    if (newPassword) {
      try {
        const response = await axios.post(`http://192.168.1.3:5000/api/users/reset-password/${token}`, { newPassword });

        if (response.status === 200) {
          Alert.alert('Success', 'Your password has been reset successfully.');
        }
      } catch (error) {
        Alert.alert('Error', error.response?.data?.message || 'Something went wrong.');
      }
    } else {
      Alert.alert('Error', 'Please enter a new password.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter new password"
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
        <Text style={styles.buttonText}>Reset Password</Text>
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

export default ResetPassword;
