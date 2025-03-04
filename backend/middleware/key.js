const crypto = require('crypto');

// Generate a 256-bit (32-byte) secret key, encoded in base64
const secret = crypto.randomBytes(32).toString('hex');
console.log(secret);
import AsyncStorage from '@react-native-async-storage/async-storage';

// Store token after successful login
const storeToken = async (token) => {
  try {
    await AsyncStorage.setItem('jwt_token', token); // Store the token
    console.log("Token stored successfully");
  } catch (error) {
    console.error('Error storing token:', error);
  }
};
