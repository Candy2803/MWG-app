import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useAuth } from "../Auth/AuthContext";

const Login = ({ navigation }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }
  
    try {
      const response = await axios.post(
        `https://welfare-api-kappa.vercel.app/api/users/login`, 
        { email, password }
      );
  
      console.log("Login response:", response);  // Log the response
  
      const { user, token } = response.data;
  
      if (!token) {
        Alert.alert("Error", "No authentication token received");
        return;
      }
  
      // Store the token in AsyncStorage with a consistent key
      await AsyncStorage.setItem("AUTH_TOKEN", token);
  
      // Set the token in axios default headers
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  
      // Check if the user is an admin or already approved
      if (user.role === "admin" || user.isApproved) {
        login(user);
        Alert.alert("Success", "Login successful");
      } else {
        Alert.alert("Error", "Your account needs approval before you can log in.");
      }
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert(
        "Login Failed", 
        error.response?.data?.message || "An error occurred during login"
      );
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    textAlign: "center",
    marginBottom: 20,
    fontWeight: "bold",
  },
  input: {
    height: 50,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  button: {
    backgroundColor: "#6200ee",
    padding: 15,
    borderRadius: 20,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  linkText: {
    marginTop: 15,
    textAlign: "center",
    color: "#6200ee",
  },
});

export default Login;