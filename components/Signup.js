import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import axios from 'axios';

const Signup = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const handleSignup = async () => {
    if (username && email && phone && password) {
      try {
        const response = await axios.post('http://localhost:5000/api/users/register', {
          name: username,
          email: email,
          phone: phone,
          password: password,
        });
        if (response.status === 201) {
          alert('Signup successful');
          navigation.navigate('Profile'); 
        }
      } catch (error) {
        alert('Signup failed: ' + error.response.data.message);
      }
    } else {
      alert('Please fill all fields');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create an Account</Text>

      <TextInput 
        style={styles.input} 
        placeholder="Username" 
        placeholderTextColor="#ccc"
        value={username} 
        onChangeText={setUsername} 
      />
      
      <TextInput 
        style={styles.input} 
        placeholder="Email" 
        placeholderTextColor="#ccc"
        value={email} 
        onChangeText={setEmail} 
        keyboardType="email-address" 
      />

      <TextInput 
        style={styles.input} 
        placeholder="Phone Number" 
        placeholderTextColor="#ccc"
        value={phone} 
        onChangeText={setPhone} 
        keyboardType="phone-pad" 
      />

      <TextInput 
        style={styles.input} 
        placeholder="Password" 
        placeholderTextColor="#ccc"
        value={password} 
        onChangeText={setPassword} 
        secureTextEntry 
      />

      <TouchableOpacity style={styles.button} onPress={handleSignup}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.linkText}>Already have an account? Log in</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: { 
    width: '100%', 
    height: 50, 
    borderColor: '#ccc', 
    borderWidth: 1, 
    borderRadius: 8, 
    paddingHorizontal: 10, 
    marginBottom: 10,
    color: '#000'
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
  buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  linkText: { color: '#6200ee', marginTop: 10 },
});

export default Signup;
