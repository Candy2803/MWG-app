import React, { useState } from "react";
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert } from "react-native";
import * as DocumentPicker from "expo-document-picker"; // For Expo
import { useNavigation } from '@react-navigation/native'; // To navigate to ChatPage
import axios from 'axios'; // For HTTP requests
import io from 'socket.io-client'; // For socket connection

const MoneyMarketPage = () => {
  const [files, setFiles] = useState([]); // Store selected files
  const socket = io("http://192.168.1.201:5000"); // Socket connection
  const navigation = useNavigation(); // To navigate to ChatPage

  // Function to pick a document
  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*", // Allow any file type
      });

      if (result.type === "cancel") {
        Alert.alert("Canceled", "You did not select a document.");
        return;
      }

      const file = result;
      const updatedFiles = [...files, file];
      setFiles(updatedFiles); // Save the file to state

    } catch (error) {
      console.error("Error picking document:", error);
      Alert.alert("Error", "An error occurred while picking the document.");
    }
  };

  const uploadFileToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", {
      uri: Platform.OS === 'ios' ? file.uri : file.uri.replace("file://", ""), // Adjust for iOS/Android
      name: file.name,
      type: file.mimeType || "application/octet-stream", // Ensure correct MIME type
    });
  
    try {
      const response = await axios.post("http://192.168.1.201:5000/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
  
      const result = response.data;
      if (result.url) {
        const fileMessage = {
          type: "file",
          fileUri: result.url, // Cloudinary URL
          fileName: file.name, // File name
          userName: "Admin", // Sender's name
        };
  
        // Emit the file message to the chat server
        socket.emit("sendMessage", fileMessage);
  
        Alert.alert("Success", "File uploaded and shared in chat.");
  
        // Navigate to the ChatPage after sharing the file
        navigation.navigate("ChatPage");
      } else {
        Alert.alert("Error", "File upload failed.");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      Alert.alert("Error", "An error occurred while uploading the file.");
    }
  };
  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Money Market Statements</Text>

      <TouchableOpacity style={styles.uploadButton} onPress={pickDocument}>
        <Text style={styles.uploadButtonText}>Upload File</Text>
      </TouchableOpacity>

      {files.length > 0 && (
        <FlatList
          data={files}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.fileContainer}>
              <Text style={styles.fileName}>{item.name}</Text>
              <TouchableOpacity
                style={styles.shareButton}
                onPress={() => uploadFileToCloudinary(item)} // Upload and share the file
              >
                <Text style={styles.shareButtonText}>Share</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  uploadButton: {
    backgroundColor: "#6200ee",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  uploadButtonText: {
    color: "white",
    fontSize: 16,
  },
  fileContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
  },
  fileName: {
    fontSize: 16,
    color: "#333",
  },
  shareButton: {
    backgroundColor: "#0084FF",
    padding: 10,
    borderRadius: 8,
  },
  shareButtonText: {
    color: "white",
    fontSize: 14,
  },
});

export default MoneyMarketPage;
