import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useAuth } from "../Auth/AuthContext";
import { getJWTToken } from "../utils/AuthUtils"; // Import the function
import { BASE_URL } from "../config";

const Login = ({ navigation }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accessToken, setAccessToken] = useState("");

  const handleLogin = async () => {
    if (email && password) {
      try {
        const response = await axios.post(
          `${BASE_URL}/users/login`, 
          { email, password }
        );

        const { token, user } = response.data; // Assuming token is in response.data.token

        if (token) {
          await AsyncStorage.setItem("userToken", token); // Store the token in AsyncStorage
          setAccessToken(token); // Update local state with the token
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`; // Set token globally for future requests
        }

        // Check if the user is an admin or already approved
        if (user.role === "admin" || user.isApproved) {
          login(user);
          alert("Login successful");
        } else {
          alert("Your account needs approval before you can log in.");
        }
      } catch (error) {
        alert(
          "Login failed: " + (error.response?.data?.message || error.message)
        );
      }
    } else {
      alert("Please enter email and password");
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
      <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")}>
        <Text style={styles.linkText}>Forgot Password?</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
        <Text style={styles.linkText}>Don't have an account? Sign Up</Text>
      </TouchableOpacity>

      {accessToken ? (
        <Text style={styles.tokenText}>Access Token: {accessToken}</Text>
      ) : null}
    </View>
  );
};
