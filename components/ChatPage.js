import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useAuth } from "../Auth/AuthContext";
import io from "socket.io-client";
import * as FileSystem from "expo-file-system"; // For handling file downloads (if using Expo)
import * as WebBrowser from "expo-web-browser"; // For opening URLs in a browser
import AsyncStorage from "@react-native-async-storage/async-storage";

const ChatPage = () => {
  const { user } = useAuth(); // Assuming 'user' object contains user info (name, profilePic, etc.)
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const socket = io("http://192.168.1.201:4000"); // Use your IP address here

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to the server");
    });

    socket.on("message", (newMessage) => {
      console.log("Received message:", newMessage);
      if (Array.isArray(newMessage)) {
        setMessages(newMessage); // Set the message history if it's an array
      } else {
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      }
    });

    return () => {
      socket.off("message");
    };
  }, []);

  const generateUniqueId = () => {
    return `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  };

  const sendMessage = () => {
    if (message.trim() !== "") {
      const newMessage = {
        id: generateUniqueId(), // Ensure unique ID
        text: message,
        userName: user.name, // Use current user's name
        timestamp: new Date().toLocaleTimeString(),
      };

      // Emit the message to the server
      socket.emit("sendMessage", newMessage);

      setMessage(""); // Clear the input field after sending
    } else {
      console.log("Message is empty, not sending.");
    }
  };

  const downloadFile = async (uri) => {
    if (!uri) {
      console.error("Invalid file URI");
      Alert.alert("Download Error", "Invalid file URI.");
      return;
    }
  
    try {
      // Check if URI is a valid string
      if (typeof uri !== "string" || uri.trim() === "") {
        console.error("Invalid file URI");
        Alert.alert("Download Error", "Invalid file URI.");
        return;
      }
  
      // Retrieve stored file data (if needed, for example, checking if the file is already stored)
      const storedFiles = await AsyncStorage.getItem("files");
      const files = storedFiles ? JSON.parse(storedFiles) : [];
  
      console.log("Stored files:", files); // Log stored files for debugging
      
      // For Expo, use FileSystem to download the file
      const fileUri = FileSystem.documentDirectory + uri.split("/").pop(); // Construct the file path in the document directory
      await FileSystem.downloadAsync(uri, fileUri);
  
      // Optionally, update the stored files with the new file (if needed)
      const updatedFiles = [...files, { uri: fileUri }];
      await AsyncStorage.setItem("files", JSON.stringify(updatedFiles)); // Persist files again after download
      
      Alert.alert("Download Complete", "The file has been downloaded to your device.");
    } catch (error) {
      console.error("Error downloading file:", error);
      Alert.alert("Download Error", "There was an issue downloading the file.");
    }
  };

  const viewFile = async (uri) => {
    if (!uri) {
      Alert.alert("Error", "File URI is invalid.");
      return;
    }
    console.log("File URI to open:", uri); // Debugging URI
  
    const fileExtension = uri.split(".").pop().toLowerCase();
    
    if (!uri.endsWith(".pdf") && !uri.endsWith(".pdf")) {
      Alert.alert("Invalid URL", "The file URL is not valid. Make sure the URL starts with http:// or https://");
      return;
    }
  
    // Handle PDF files
    if (fileExtension === "pdf") {
      try {
        await WebBrowser.openBrowserAsync(uri); // Open the PDF URL in the browser
      } catch (error) {
        console.error("Error opening PDF:", error);
        Alert.alert("Error", "There was an issue opening the PDF file.");
      }
    }
    // Handle Image files
    else if (
      fileExtension === "jpg" ||
      fileExtension === "jpeg" ||
      fileExtension === "png"
    ) {
      try {
        await WebBrowser.openBrowserAsync(uri); // Open the image in the browser
      } catch (error) {
        console.error("Error opening image:", error);
        Alert.alert("Error", "There was an issue opening the image file.");
      }
    }
    // For unsupported types, provide a warning
    else {
      Alert.alert("Cannot View", "This file format cannot be viewed directly.");
    }
  };
  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chat</Text>

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id || item.timestamp || Math.random().toString()} // Use unique key for each item
        renderItem={({ item }) => (
          <View
            style={[
              styles.messageContainer,
              item.userName === user.name
                ? styles.selfMessage // Align self messages to the right
                : styles.receivedMessage, // Align received messages to the left
              item.type === "file" && styles.fileMessage, // Apply style for file messages
            ]}
          >
            {/* If the message is a file message */}
            {item.type === "file" ? (
              <View style={styles.fileMessageContent}>
                <Text style={styles.messageText}>
                  {item.userName} shared a file: {item.fileName}
                </Text>
                <TouchableOpacity
                  style={styles.downloadButton}
                  onPress={() => downloadFile(item.fileUri)} // Download the file
                >
                  <Text style={styles.downloadButtonText}>Download</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.viewButton}
                  onPress={() => viewFile(item.fileUri)} // View the file
                >
                  <Text style={styles.viewButtonText}>View</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.textMessageContent}>
                <Text style={styles.messageText}>{item.text}</Text>
              </View>
            )}

            {/* Message Header */}
            <View style={styles.messageHeader}>
              <Text style={styles.userName}>{item.userName}</Text>
              <Text style={styles.timestamp}>{item.timestamp}</Text>
            </View>
          </View>
        )}
      />

      {/* Input Section */}
      <KeyboardAvoidingView
        style={styles.inputContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"} // Different behavior for iOS and Android
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type your message..."
            value={message}
            onChangeText={setMessage}
          />
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <Icon name="send" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  messageContainer: {
    marginBottom: 10,
    flexDirection: "column",
    width: "100%",
  },
  selfMessage: {
    alignItems: "flex-end", // Align self-sent messages to the right
  },
  receivedMessage: {
    alignItems: "flex-start", // Align received messages to the left
  },
  fileMessageContent: {
    backgroundColor: "#0084FF", // File message background color
    padding: 10,
    borderRadius: 8,
    marginVertical: 5,
    maxWidth: "80%",
  },
  downloadButton: {
    backgroundColor: "#6200ee", // Color for the download button
    padding: 10,
    borderRadius: 8,
    marginTop: 5,
  },
  downloadButtonText: {
    color: "white",
    fontSize: 14,
  },
  viewButton: {
    backgroundColor: "#6200ee", // Color for the view button
    padding: 10,
    borderRadius: 8,
    marginTop: 5,
  },
  viewButtonText: {
    color: "white",
    fontSize: 14,
  },
  textMessageContent: {
    backgroundColor: "#6200ee", // For text messages
    padding: 10,
    borderRadius: 8,
    marginVertical: 5,
  },
  messageText: {
    color: "white",
    fontSize: 16,
  },
  messageHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  userName: {
    fontWeight: "bold",
    marginRight: 10,
  },
  timestamp: {
    fontSize: 12,
    color: "#888",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 8,
    padding: 5,
    marginBottom: 40,
    width: "100%",
  },
  input: {
    flex: 1,
    padding: 10,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: "#6200ee",
    padding: 10,
    borderRadius: 8,
    marginLeft: 10,
  },
});

export default ChatPage;
