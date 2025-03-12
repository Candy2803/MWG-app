import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ImageBackground,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useAuth } from "../Auth/AuthContext";
import Icon from "react-native-vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";

const Login = ({ navigation }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Missing Information", "Please enter both email and password");
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(
        `http://192.168.0.107:5000/api/users/login`,
        { email, password }
      );

      console.log("Login response:", response);
      const { user, token } = response.data;

      if (!token) {
        Alert.alert("Authentication Error", "No authentication token received");
        setIsLoading(false);
        return;
      }

      await AsyncStorage.setItem("AUTH_TOKEN", token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      if (user.role === "admin" || user.isApproved) {
        login(user);
        // Don't show alert here as it's unnecessary with the success animation
      } else {
        Alert.alert(
          "Account Pending Approval", 
          "Your account is awaiting administrator approval. You'll be notified once approved.",
          [{ text: "OK", style: "default" }]
        );
      }
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert(
        "Login Failed",
        error.response?.data?.message || "An error occurred during login. Please check your credentials."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <ImageBackground
      source={{ uri: "https://ik.imagekit.io/candyjess/pic.JPG?updatedAt=1739352736306" }}
      style={styles.background}
      resizeMode="cover"
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollView}>
          <LinearGradient
            colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.5)']}
            style={styles.overlay}
          >
            <View style={styles.logoContainer}>
              <Icon name="cash" size={80} color="#fff" />
              <Text style={styles.appName}>MWG App</Text>
            </View>

            <View style={styles.formContainer}>
              <Text style={styles.welcomeText}>Welcome Back</Text>
              <Text style={styles.subtitle}>Sign in to continue</Text>

              <View style={styles.inputContainer}>
                <Icon name="mail-outline" size={22} color="#ccc" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="#ccc"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  returnKeyType="next"
                />
              </View>

              <View style={styles.inputContainer}>
                <Icon name="lock-closed-outline" size={22} color="#ccc" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="#ccc"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  returnKeyType="done"
                />
                <TouchableOpacity 
                  onPress={togglePasswordVisibility}
                  style={styles.eyeIcon}
                >
                  <Icon 
                    name={showPassword ? "eye-off-outline" : "eye-outline"} 
                    size={22} 
                    color="#ccc" 
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity 
                style={styles.forgotPassword}
                onPress={() => navigation.navigate("ForgotPassword")}
              >
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.loginButton} 
                onPress={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.loginButtonText}>LOGIN</Text>
                )}
              </TouchableOpacity>

              <View style={styles.orContainer}>
                <View style={styles.divider} />
                <Text style={styles.orText}>OR</Text>
                <View style={styles.divider} />
              </View>

              <View style={styles.signupContainer}>
                <Text style={styles.noAccountText}>Don't have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
                  <Text style={styles.signupText}>Sign Up</Text>
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  appName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 10,
  },
  formContainer: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 16,
    padding: 24,
    backdropFilter: "blur(10px)",
  },
  welcomeText: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#ddd",
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 12,
    marginBottom: 16,
    height: 55,
  },
  inputIcon: {
    marginHorizontal: 15,
  },
  eyeIcon: {
    padding: 15,
  },
  input: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
    height: "100%",
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: "#fff",
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: "#8a2be2",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#8a2be2",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  loginButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 1,
  },
  orContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  orText: {
    color: "#fff",
    marginHorizontal: 10,
    fontSize: 14,
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },
  noAccountText: {
    color: "#ddd",
    fontSize: 15,
  },
  signupText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
});

export default Login;