import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";
import { useAuth } from "../Auth/AuthContext";
import { launchImageLibrary } from "react-native-image-picker";
import axios from "axios"; // Make sure Axios is installed
import { getJWTToken } from "../utils/AuthUtils"; // Import the function
import {BASE_URL} from '../config'

const EditProfile = ({ navigation }) => {
  const { user, updateUser } = useAuth();
  const [name, setname] = useState(user?.name || "");
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
    if (name && email && phone) {
      // Check if passwords match
      if (newPassword !== confirmPassword) {
        alert("Passwords do not match");
        return;
      }
  
      // Make sure the user provided the current password when updating the password
      if (newPassword && currentPassword) {
        try {
          // Retrieve the JWT token from AsyncStorage
          const token = await getJWTToken();
          
          if (!token) {
            alert("Authorization token is missing. Please log in again.");
            return;
          }
  
          // Send a request to your backend to update the password
          const response = await axios.put(
            `${BASE_URL}/reset/update-password`, // Assuming the correct endpoint
            {
              currentPassword, // Use the actual current password from the state
              newPassword,     // Use the new password from the state
            },
            {
              headers: {
                Authorization: `Bearer ${token}`, // Use the token retrieved from AsyncStorage
              },
            }
          );
  
          if (response.status === 200) {
            alert("Password updated successfully!");
          } else {
            alert("Failed to update password.");
          }
        } catch (error) {
          alert(
            "Error updating password: " +
              (error.response?.data?.message || error.message)
          );
        }
      }
  
      // Update user profile information (make sure to pass the correct fields here)
      updateUser({ name, email, phone, profileImage, newPassword });
      alert("Profile updated successfully!");
      navigation.goBack();
    } else {
      alert("Please fill all fields");
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
        onChangeText={setname}
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
