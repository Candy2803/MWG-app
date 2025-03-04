import AsyncStorage from '@react-native-async-storage/async-storage';
import jwt_decode from 'jwt-decode';
await AsyncStorage.setItem("1a4d689bf0e18462d282928fff2cb73c29ca6214fccd38eb2afb77443d26b3da", token);


export const getJWTToken = async () => {
  try {
    const token = await AsyncStorage.getItem('1a4d689bf0e18462d282928fff2cb73c29ca6214fccd38eb2afb77443d26b3da'); // Use your token key
    if (!token) {
      console.error('No token found');
      return null;
    }

    // Decode the JWT to get the payload
    const decodedToken = jwt_decode(token);

    // Get the current time and compare with the token's expiration time (exp claim)
    const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
    if (decodedToken.exp < currentTime) {
      console.error('Token has expired');
      return null;
    }

    // Token is valid, return it
    return token;
  } catch (error) {
    console.error('Error retrieving or decoding token:', error);
    return null;
  }
};
