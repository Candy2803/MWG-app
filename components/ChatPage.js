import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { useAuth } from "../Auth/AuthContext"; // Assumed context
import io from "socket.io-client";
import * as WebBrowser from "expo-web-browser"; // For opening links in the browser

const ChatPage = () => {
  const { user } = useAuth(); // Assumes user context is available
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState(""); // To store the message input
  const socket = io("http://192.168.1.201:5000"); // Replace with your server's URL

  // Listen for incoming messages
  useEffect(() => {
    socket.on("message", (newMessage) => {
      if (Array.isArray(newMessage)) {
        setMessages((prevMessages) => [...prevMessages, ...newMessage]);
      } else {
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      }
    });

    return () => {
      socket.off("message"); // Clean up the event listener when the component unmounts or re-renders
    };
  }, []);

  // Function to handle file opening
  const openFile = async (uri) => {
    if (uri) {
      try {
        await WebBrowser.openBrowserAsync(uri); // Open the file in a browser
      } catch (error) {
        console.error("Error opening file:", error);
        Alert.alert("Error", "There was an issue opening the file.");
      }
    }
  };

  // Function to send text message
  const [isSending, setIsSending] = useState(false); // Track sending state

  const sendMessage = () => {
    if (newMessage.trim() && !isSending) {
      setIsSending(true); // Prevent sending again

      const message = {
        type: "text",
        text: newMessage,
        userName: user.name,
        timestamp: new Date().toLocaleTimeString(),
      };

      socket.emit("sendMessage", message); // Send message to server

      setMessages((prevMessages) => [...prevMessages, message]); // Update messages locally
      setNewMessage(""); // Clear input field

      setIsSending(false); // Allow sending after the message is sent
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chat</Text>

      {/* Display messages */}
      <FlatList
        data={messages}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View
            style={[
              styles.messageContainer,
              item.userName === user.name
                ? styles.selfMessage
                : styles.receivedMessage,
            ]}
          >
            <View style={styles.messageHeader}>
              <Text style={styles.userName}>{item.userName}</Text>
              <Text style={styles.timestamp}>{item.timestamp}</Text>
            </View>

            {/* Display file message */}
            {item.type === "file" ? (
              <TouchableOpacity onPress={() => openFile(item.fileUri)}>
                <Text style={styles.fileMessageText}>
                  Open File: {item.fileName}
                </Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.messageText}>{item.text}</Text>
            )}
          </View>
        )}
      />

      {/* Input area for sending new message */}
      <KeyboardAvoidingView behavior="padding">
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            value={newMessage}
            onChangeText={setNewMessage} // Update the input state
          />
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
  messageContainer: {
    marginBottom: 10,
    flexDirection: "column",
    width: "100%",
  },
  selfMessage: {
    alignItems: "flex-end",
  },
  receivedMessage: {
    alignItems: "flex-start",
  },
  fileMessageText: {
    color: "#0084FF",
    fontSize: 16,
    textDecorationLine: "underline",
  },
  messageText: {
    fontSize: 16,
    color: "#333",
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
    paddingTop: 10,
    alignItems: "center",
    borderTopWidth: 1,
    borderColor: "#ddd",
    marginBottom: 60,
  },
  input: {
    flex: 1,
    padding: 10,
    borderRadius: 25,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: "#0084FF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  sendButtonText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default ChatPage;
