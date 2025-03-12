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
import * as ImagePicker from "expo-image-picker";
import axios from "axios";

const EditProfile = ({ navigation }) => {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [profileImage, setProfileImage] = useState(user?.profileImage || null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSelectImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.status !== "granted") {
      Alert.alert("Permission Denied", "Permission to access the media library is required!");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.cancelled && result.assets && result.assets.length > 0) {
      console.log("Selected image:", result.assets[0].uri);
      setProfileImage(result.assets[0].uri);
    } else {
      console.log("No image selected");
    }
  };

  const uploadProfileImage = async () => {
    if (!profileImage) {
      Alert.alert("Error", "Please select an image first.");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("profilePicture", {
        uri: profileImage,
        name: `profile_${Date.now()}.jpg`,
        type: "image/jpeg",
      });
      console.log("Uploading image to server...");

      // Upload to Cloudinary via your server
      const uploadResponse = await axios.post(
        "http://192.168.1.201:4000/uploadProfilePicture",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      console.log("Upload response:", uploadResponse.data);

      if (uploadResponse.data && uploadResponse.data.url) {
        const newImageUrl = uploadResponse.data.url;
        // Update the user's profile image in the database
        const updateResponse = await axios.put(
          `http://192.168.1.201:4000/api/users/${user._id}`,
          { profileImage: newImageUrl },
          { headers: { "Content-Type": "application/json" } }
        );
        console.log("User update response:", updateResponse.data);

        if (updateResponse.status === 200) {
          updateUser({ ...user, profileImage: newImageUrl });
          Alert.alert("Success", "Profile picture updated.");
        } else {
          Alert.alert("Error", "Failed to update profile picture in the database.");
        }
      } else {
        Alert.alert("Error", "Failed to upload profile picture.");
      }
    } catch (error) {
      console.error("Error uploading profile picture:", error.response || error);
      Alert.alert("Error", "Failed to upload profile picture: " + error.message);
    }
  };

  const handleSave = async () => {
    if (!name || !email || !phone) {
      Alert.alert("Error", "Please fill all profile fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New passwords do not match");
      return;
    }
    try {
      const updatedProfile = {
        name,
        email,
        phone,
        profileImage,
      };
      updateUser(updatedProfile);
      Alert.alert("Success", "Profile updated successfully!");
      navigation.goBack();
    } catch (error) {
      console.error("Update error:", error);
      Alert.alert("Error", "Failed to update profile. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Profile</Text>

      {/* Tap the image container to select a new image */}
      <TouchableOpacity style={styles.imageContainer} onPress={handleSelectImage}>
        {profileImage ? (
          <Image source={{ uri: profileImage }} style={styles.profileImage} />
        ) : (
          <Text style={styles.imageText}>Select Image</Text>
        )}
      </TouchableOpacity>
      <Text style={styles.imageText}>Tap the image to change it.</Text>

      {/* Button to upload the new profile picture */}
      {profileImage && (
        <TouchableOpacity style={styles.uploadButton} onPress={uploadProfileImage}>
          <Text style={styles.uploadButtonText}>Upload Profile Picture</Text>
        </TouchableOpacity>
      )}

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
      <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20 },
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
  profileImage: { width: "100%", height: "100%", borderRadius: 60 },
  imageText: { color: "#6200ee", fontWeight: "bold" },
  uploadButton: {
    backgroundColor: "#6200ee",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  uploadButtonText: { color: "white", fontSize: 16, fontWeight: "bold" },
  button: {
    backgroundColor: "#6200ee",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
    marginBottom: 10,
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
