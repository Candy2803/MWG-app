import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from "react-native";
import { useAuth } from "../Auth/AuthContext";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";

const EditProfile = ({ navigation }) => {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [profileImage, setProfileImage] = useState(user?.profileImage || null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
    
    setIsLoading(true);
    
    try {
      const formData = new FormData();
      formData.append("profilePicture", {
        uri: profileImage,
        name: `profile_${Date.now()}.jpg`,
        type: "image/jpeg",
      });
  
      // Upload to Cloudinary via your server
      const uploadResponse = await axios.post(
        "https://mwg-app-api.vercel.app/uploadProfilePicture",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
  
      if (uploadResponse.data && uploadResponse.data.url) {
        const newImageUrl = uploadResponse.data.url;
        
        // Update user profile with new image URL
        const updateResponse = await axios.put(
          `https://mwg-app-api.vercel.app/api/users/${user._id}`,
          { profileImage: newImageUrl },
          { headers: { "Content-Type": "application/json" } }
        );
  
        if (updateResponse.status === 200) {
          updateUser({ ...user, profileImage: newImageUrl });
          Alert.alert("Success", "Profile picture updated.");
        }
      }
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      Alert.alert("Error", "Failed to upload profile picture: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSave = async () => {
    if (!name || !email || !phone) {
      Alert.alert("Error", "Please fill all profile fields");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Create the updated profile object
      const updatedProfile = {
        name,
        email,
        phone,
        profileImage,
      };
  
      // Make sure user._id exists
      if (!user?._id) {
        Alert.alert("Error", "User ID not found");
        return;
      }
  
      // Log the request details for debugging
      console.log("Updating user with ID:", user._id);
      console.log("Update data:", updatedProfile);
  
      // Make API call to update user in database
      const response = await axios.put(
        `https://mwg-app-api.vercel.app/api/users/${user._id}/update`,
        updatedProfile,
        {
          headers: { 
            "Content-Type": "application/json"
          }
        }
      );
  
      if (response.status === 200) {
        // Update local user state
        updateUser(updatedProfile);
        Alert.alert("Success", "Profile updated successfully!");
        navigation.goBack();
      }
    } catch (error) {
      console.error("Update error:", error.response || error);
      Alert.alert(
        "Error", 
        `Failed to update profile: ${error.response?.data?.message || error.message}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const InputField = ({ icon, placeholder, value, onChangeText, keyboardType, secureTextEntry }) => (
    <View style={styles.inputContainer}>
      <Ionicons name={icon} size={22} color="#6200ee" style={styles.inputIcon} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType || "default"}
        secureTextEntry={secureTextEntry}
        placeholderTextColor="#999"
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          

          <View style={styles.imageWrapper}>
            <TouchableOpacity style={styles.imageContainer} onPress={handleSelectImage}>
              {profileImage ? (
                <>
                  <Image source={{ uri: profileImage }} style={styles.profileImage} />
                  <View style={styles.editIconContainer}>
                    <Ionicons name="camera" size={18} color="white" />
                  </View>
                </>
              ) : (
                <View style={styles.placeholderContainer}>
                  <Ionicons name="person" size={50} color="#bbb" />
                  <View style={styles.editIconContainer}>
                    <Ionicons name="camera" size={18} color="white" />
                  </View>
                </View>
              )}
            </TouchableOpacity>
            <Text style={styles.imageText}>Tap to change profile photo</Text>

            {profileImage && (
              <TouchableOpacity 
                style={styles.uploadButton} 
                onPress={uploadProfileImage}
                disabled={isLoading}
              >
                <Text style={styles.uploadButtonText}>
                  {isLoading ? "Uploading..." : "Upload Photo"}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            <InputField 
              icon="person-outline" 
              placeholder="Username" 
              value={name} 
              onChangeText={setName} 
            />
            <InputField 
              icon="mail-outline" 
              placeholder="Email" 
              value={email} 
              onChangeText={setEmail} 
              keyboardType="email-address" 
            />
            <InputField 
              icon="call-outline" 
              placeholder="Phone Number" 
              value={phone} 
              onChangeText={setPhone} 
              keyboardType="phone-pad" 
            />
          </View>

          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Change Password</Text>
            <InputField 
              icon="lock-closed-outline" 
              placeholder="Current Password" 
              value={currentPassword} 
              onChangeText={setCurrentPassword} 
              secureTextEntry 
            />
            <InputField 
              icon="lock-closed-outline" 
              placeholder="New Password" 
              value={newPassword} 
              onChangeText={setNewPassword} 
              secureTextEntry 
            />
            <InputField 
              icon="lock-closed-outline" 
              placeholder="Confirm New Password" 
              value={confirmPassword} 
              onChangeText={setConfirmPassword} 
              secureTextEntry 
            />
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.button} 
              onPress={handleSave}
              disabled={isLoading}
            >
              {isLoading ? (
                <Text style={styles.buttonText}>Saving...</Text>
              ) : (
                <>
                  <Ionicons name="save-outline" size={20} color="white" style={styles.buttonIcon} />
                  <Text style={styles.buttonText}>Save Changes</Text>
                </>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={() => navigation.goBack()}
              disabled={isLoading}
            >
              <Ionicons name="close-outline" size={20} color="white" style={styles.buttonIcon} />
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: "#f8f8f8" 
  },
  keyboardView: { 
    flex: 1 
  },
  scrollContainer: { 
    flexGrow: 1, 
    padding: 20 
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    paddingVertical: 10,
  },
  backButton: {
    padding: 5,
  },
  title: { 
    fontSize: 24, 
    fontWeight: "bold", 
    color: "#333",
    textAlign: "center",
  },
  imageWrapper: {
    alignItems: "center",
    marginBottom: 30,
  },
  imageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: "relative",
  },
  profileImage: { 
    width: "100%", 
    height: "100%", 
    borderRadius: 60 
  },
  placeholderContainer: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 60,
    backgroundColor: "#f0f0f0",
  },
  editIconContainer: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#6200ee",
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "white",
  },
  imageText: { 
    color: "#6200ee", 
    fontWeight: "500",
    marginTop: 10,
    fontSize: 14,
  },
  uploadButton: {
    backgroundColor: "#6200ee",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  uploadButtonText: { 
    color: "white", 
    fontSize: 14, 
    fontWeight: "600" 
  },
  formSection: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 15,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#e0e0e0",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: "#fcfcfc",
  },
  inputIcon: {
    padding: 10,
  },
  input: {
    flex: 1,
    height: 50,
    paddingHorizontal: 10,
    color: "#333",
    fontSize: 16,
  },
  buttonContainer: {
    marginTop: 10,
    marginBottom: 30,
  },
  button: {
    backgroundColor: "#6200ee",
    paddingVertical: 14,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    shadowColor: "#6200ee",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonText: { 
    color: "white", 
    fontSize: 16, 
    fontWeight: "bold" 
  },
  buttonIcon: {
    marginRight: 8
  },
  cancelButton: {
    backgroundColor: "#ff5252",
    paddingVertical: 14,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#ff5252",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  cancelButtonText: { 
    color: "white", 
    fontSize: 16, 
    fontWeight: "bold" 
  },
});

export default EditProfile;