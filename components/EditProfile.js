import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
} from "react-native";
import { useAuth } from "../Auth/AuthContext";
import { launchImageLibrary } from "react-native-image-picker";
import axios from "axios";
import { BASE_URL } from '../config';
import AsyncStorage from "@react-native-async-storage/async-storage";

const EditProfile = ({ navigation }) => {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [profileImage, setProfileImage] = useState(user?.profileImage || null);

  // Password Change Fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSelectImage = () => {
    launchImageLibrary({ mediaType: "photo" }, (response) => {
      if (response.didCancel) {
        console.log("User canceled image picker");
      } else if (response.errorMessage) {
        console.log("ImagePicker Error:", response.errorMessage);
      } else {
        setProfileImage(response.assets[0].uri);
      }
    });
  };

  const handleSave = async () => {
    // Validate input fields
    if (!name || !email || !phone) {
      Alert.alert("Error", "Please fill all profile fields");
      return;
    }
  
    // Password change validation
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New passwords do not match");
      return;
    }
  
    try {
      // Get the authentication token from AsyncStorage
      const token = await AsyncStorage.getItem("AUTH_TOKEN");
  
      if (!token) {
        Alert.alert("Error", "Authentication token not found. Please login again.");
        navigation.navigate("Login");
        return;
      }
  
      // Prepare the headers with the token
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
  
      // Prepare the password update request only if new password is provided
      if (newPassword) {
        const passwordUpdateResponse = await axios.put(
          `http://192.168.1.201:5000/api/reset/update-password`,
          {
            email,
            currentPassword,
            newPassword,
          },
          config
        );
        
        if (passwordUpdateResponse.status !== 200) {
          throw new Error('Password update failed');
        }
      }
  
      // Profile update data (update profile and password together)
      const updatedProfile = {
        name,
        email,
        phone,
        profileImage,
      };
  
      // Update user profile information
      const profileUpdateResponse = await axios.put(
        `http://192.168.1.201:5000/api/users/${user._id}`,
        updatedProfile,
        config
      );
  
      if (profileUpdateResponse.status === 200) {
        // Update local user state with the new profile data
        updateUser(profileUpdateResponse.data.user);
  
        Alert.alert("Success", "Profile updated successfully!");
        navigation.goBack();
      }
    } catch (error) {
      console.error("Update error:", error.response?.data || error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to update profile. Please try again."
      );
    }
  };
  
  
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Profile</Text>

      <TouchableOpacity
        style={styles.imageContainer}
        onPress={handleSelectImage}
      >
        {profileImage ? (
          <Image source={{ uri: profileImage }} style={styles.profileImage} />
        ) : (
          <Text style={styles.imageText}>Select Image</Text>
        )}
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="Username"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />

      {/* Password Change Section */}
      <TextInput
        style={styles.input}
        placeholder="Current Password"
        value={currentPassword}
        onChangeText={setCurrentPassword}
        secureTextEntry
      />

      <TextInput
        style={styles.input}
        placeholder="New Password"
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry
      />

      <TextInput
        style={styles.input}
        placeholder="Confirm New Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Save Changes</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  input: {
    width: "100%",
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
    color: "#000",
  },
  imageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  profileImage: {
    width: "100%",
    height: "100%",
    borderRadius: 60,
  },
  imageText: { color: "#6200ee", fontWeight: "bold" },
  button: {
    backgroundColor: "#6200ee",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 10,
    width: "100%",
    alignItems: "center",
  },
  buttonText: { color: "white", fontSize: 16, fontWeight: "bold" },
  cancelButton: {
    backgroundColor: "#d9534f",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },
  cancelButtonText: { color: "white", fontSize: 16, fontWeight: "bold" },
});

export default EditProfile;