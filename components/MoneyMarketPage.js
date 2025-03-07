import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert } from "react-native";
import * as DocumentPicker from "expo-document-picker"; // For Expo
import AsyncStorage from '@react-native-async-storage/async-storage'; // AsyncStorage
import { useNavigation } from '@react-navigation/native'; // To navigate to ChatPage
import io from 'socket.io-client'; // Import socket.io

const MoneyMarketPage = () => {
  const [files, setFiles] = useState([]); // This will store all the uploaded files
  const socket = io("http://192.168.1.201:4000"); // Socket connection
  const navigation = useNavigation(); // To navigate to ChatPage

  useEffect(() => {
    const loadFiles = async () => {
      try {
        const storedFiles = await AsyncStorage.getItem("files");
        if (storedFiles) {
          setFiles(JSON.parse(storedFiles)); // Parse the stored files and set them to state
        }
      } catch (error) {
        console.error("Error loading files from AsyncStorage", error);
      }
    };

    loadFiles();
  }, []);

  // Function to pick a document and add it to the list
  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*", // Allow any file type for testing
      });

      if (result && result.assets && result.assets.length > 0) {
        const file = result.assets[0];

        // Add the picked file to the state without clearing the existing files
        const updatedFiles = [...files, file];
        setFiles(updatedFiles);

        // Save the updated files to AsyncStorage
        await AsyncStorage.setItem("files", JSON.stringify(updatedFiles)); // Persist files
        console.log("File saved to AsyncStorage:", file.name);
      } else {
        console.log("User canceled the document picker");
        Alert.alert("Canceled", "You did not select a document.");
      }
    } catch (error) {
      console.error("Error picking document:", error);
      Alert.alert("Error", "An error occurred while picking the document.");
    }
  };

  // Function to share the selected file to chat
  const shareToChat = (file) => {
    // Convert local URI to an accessible URL (in this example, just adding https:// for simplicity)
    const fileUrl = `http://192.168.1.201:4000/uploads/${file.name}`;

    const fileMessage = {
      type: "file", // File type message
      fileUri: fileUrl, // Use the file URL to access the file
      fileName: file.name, // File name
      userName: "Admin", // Sender's name
    };
  
    // Emit the message with file to the server
    socket.emit("sendMessage", fileMessage);
  
    // Navigate to ChatPage after sending the file
    navigation.navigate("ChatPage");
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
                onPress={() => shareToChat(item)} // Share to the chat
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
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
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
