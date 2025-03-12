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
  Image,
  Modal,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useAuth } from "../Auth/AuthContext";
import socket from "../socket"; // Shared socket instance
import * as FileSystem from "expo-file-system";
import * as WebBrowser from "expo-web-browser";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRoute, useFocusEffect } from "@react-navigation/native";
import { Video } from "expo-av";

const ChatPage = () => {
  const route = useRoute();
  const { fileUrl, fileName } = route.params || {};
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [fileShared, setFileShared] = useState(false);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  // Load stored messages on mount
  useEffect(() => {
    (async () => {
      try {
        const storedMessages = await AsyncStorage.getItem("chatMessages");
        if (storedMessages) {
          setMessages(JSON.parse(storedMessages));
        }
      } catch (error) {
        console.error("Error loading stored messages:", error);
      }
    })();
  }, []);

  // Save messages on change
  useEffect(() => {
    (async () => {
      try {
        await AsyncStorage.setItem("chatMessages", JSON.stringify(messages));
      } catch (error) {
        console.error("Error saving messages:", error);
      }
    })();
  }, [messages]);

  // Ensure socket connection on mount
  useEffect(() => {
    if (socket.connected) {
      setIsConnected(true);
    } else {
      socket.connect();
    }
  }, []);

  // Handle socket connection and incoming messages
  useEffect(() => {
    const handleConnect = () => {
      console.log("Connected to socket server");
      setIsConnected(true);
      socket.emit("joinRoom", "global-chat-room");
      socket.emit("getMessageHistory");
    };

    const handleDisconnect = () => {
      console.log("Disconnected from socket server");
      setIsConnected(false);
    };

    const handleMessageReceived = (newMessage) => {
      console.log("ChatPage received message:", newMessage);
      setMessages((prev) => {
        if (prev.find((msg) => msg.id === newMessage.id)) {
          return prev;
        }
        return [...prev, newMessage];
      });
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("message", handleMessageReceived);
    socket.on("messageHistory", handleMessageReceived);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("message", handleMessageReceived);
      socket.off("messageHistory", handleMessageReceived);
    };
  }, []);

  // On focus, if file params exist, share file (only once)
  useFocusEffect(
    React.useCallback(() => {
      if (fileUrl && isConnected && !fileShared) {
        console.log("Sharing file to chat:", fileUrl);
        shareFileToChat(fileUrl, fileName || "shared-document.pdf");
        setFileShared(true);
      }
    }, [fileUrl, isConnected, fileShared])
  );

  const generateUniqueId = () =>
    `${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  // Send text message without optimistic update
  const sendMessage = () => {
    if (message.trim() !== "") {
      const newMsg = {
        id: generateUniqueId(),
        text: message,
        userName: user.name,
        profileImage: user.profileImage,
        timestamp: new Date().toISOString(),
        type: "text",
      };
      socket.emit("sendMessage", newMsg);
      setMessage("");
    }
  };

  const shareFileToChat = (fileUri, fileName) => {
    if (!fileUri) return;
    const fileExtension = fileUri.split('.').pop().toLowerCase();
    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension);
    const type = isImage ? "image" : (fileExtension === "mp4" ? "video" : "file");
    const fileMsg = {
      id: generateUniqueId(),
      type,
      fileUri,
      fileName: fileName || fileUri.split("/").pop(),
      userName: user.name,
      profileImage: user.profileImage,
      timestamp: new Date().toISOString(),
      text: `${user.name} shared ${isImage ? 'an image' : type === "video" ? 'a video' : 'a file'}: ${fileName || fileUri.split("/").pop()}`,
    };
    console.log("Emitting file message:", fileMsg);
    socket.emit("sendMessage", fileMsg);
    setMessages((prev) => [...prev, fileMsg]);
  };

  const downloadFile = async (uri) => {
    if (!uri) {
      console.error("Invalid file URI");
      Alert.alert("Download Error", "Invalid file URI.");
      return;
    }
    try {
      console.log("Downloading from URI:", uri);
      const storedFiles = await AsyncStorage.getItem("files");
      const files = storedFiles ? JSON.parse(storedFiles) : [];
      const fileName = uri.split("/").pop();
      const filePath = FileSystem.documentDirectory + fileName;
      console.log("Saving file to:", filePath);
      const downloadResult = await FileSystem.downloadAsync(uri, filePath);
      console.log("Download result:", downloadResult);
      const updatedFiles = [...files, { uri: filePath, name: fileName }];
      await AsyncStorage.setItem("files", JSON.stringify(updatedFiles));
      Alert.alert("Download Complete", "File downloaded to your device.");
    } catch (error) {
      console.error("Error downloading file:", error);
      Alert.alert("Download Error", "Issue downloading file: " + error.message);
    }
  };

  const viewFile = async (uri) => {
    if (!uri) {
      Alert.alert("Error", "File URI is invalid.");
      return;
    }
    try {
      if (!uri.startsWith("http://") && !uri.startsWith("https://")) {
        if (uri.startsWith("file://")) {
          await WebBrowser.openBrowserAsync(uri);
        } else {
          Alert.alert("Invalid URL", "URL must start with http://, https://, or file://");
        }
        return;
      }
      await WebBrowser.openBrowserAsync(uri);
    } catch (error) {
      console.error("Error opening file:", error);
      Alert.alert("Error", "Issue opening file: " + error.message);
    }
  };

  const viewImage = (uri) => {
    setSelectedImage(uri);
    setImageViewerVisible(true);
  };

  const formatTimestamp = (timestamp) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return timestamp;
    }
  };

  // Handle long press to delete message (only if current user's message)
  const handleLongPressMessage = (messageId, isMyMessage) => {
    if (!isMyMessage) return;
    Alert.alert("Delete Message", "Do you want to delete this message?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
          // Optionally: socket.emit("deleteMessage", { id: messageId });
        },
      },
    ]);
  };

  const renderMessage = (item) => {
    const isMyMessage = item.userName === user.name;
    return (
      <TouchableOpacity onLongPress={() => handleLongPressMessage(item.id, isMyMessage)}>
        <View style={[styles.messageContainer, isMyMessage ? styles.selfMessage : styles.receivedMessage]}>
          <View style={styles.messageContentContainer}>
            {renderMessageContent(item)}
          </View>
          <View style={styles.messageFooter}>
            {item.profileImage ? (
              <Image source={{ uri: item.profileImage }} style={styles.messageProfileImage} />
            ) : (
              <Icon name="person-circle" size={20} color="#fff" />
            )}
            <Text style={styles.userName}>{item.userName}</Text>
            <Text style={styles.timestamp}>{formatTimestamp(item.timestamp)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderMessageContent = (item) => {
    if (item.type === "image") {
      return (
        <View style={item.userName === user.name ? styles.selfMessageContent : styles.receivedMessageContent}>
          <Text style={styles.messageText}>Shared an image: {item.fileName}</Text>
          <TouchableOpacity onPress={() => viewImage(item.fileUri)}>
            <Image source={{ uri: item.fileUri }} style={styles.thumbnailImage} resizeMode="cover" />
          </TouchableOpacity>
          <View style={styles.fileActionButtons}>
            <TouchableOpacity style={styles.fileButton} onPress={() => downloadFile(item.fileUri)}>
              <Icon name="download-outline" size={18} color="white" />
              <Text style={styles.fileButtonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.fileButton} onPress={() => viewImage(item.fileUri)}>
              <Icon name="expand-outline" size={18} color="white" />
              <Text style={styles.fileButtonText}>Full View</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    } else if (item.type === "file") {
      return (
        <View style={item.userName === user.name ? styles.selfMessageContent : styles.receivedMessageContent}>
          <Text style={styles.messageText}>Shared a file: {item.fileName}</Text>
          <View style={styles.fileActionButtons}>
            <TouchableOpacity style={styles.fileButton} onPress={() => downloadFile(item.fileUri)}>
              <Icon name="download-outline" size={18} color="white" />
              <Text style={styles.fileButtonText}>Download</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.fileButton} onPress={() => viewFile(item.fileUri)}>
              <Icon name="eye-outline" size={18} color="white" />
              <Text style={styles.fileButtonText}>View</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    } else if (item.type === "meeting") {
      return (
        <View style={item.userName === user.name ? styles.selfMessageContent : styles.receivedMessageContent}>
          <Text style={styles.messageText}>📅 Meeting: {item.title}</Text>
          <View style={styles.meetingDetails}>
            <Text style={styles.meetingTime}>
              {new Date(item.startDate).toLocaleString()} - {new Date(item.endDate).toLocaleTimeString()}
            </Text>
            <Text style={styles.meetingLocation}>
              Location: {item.location}
              {item.meetingLink && ` (${item.meetingLink})`}
            </Text>
            {item.isRecurring && <Text style={styles.meetingRecurring}>Recurring: {item.recurringType}</Text>}
          </View>
          <View style={styles.fileActionButtons}>
            <TouchableOpacity style={styles.fileButton} onPress={() => Alert.alert("Meeting Details", item.icalString)}>
              <Icon name="calendar-outline" size={18} color="white" />
              <Text style={styles.fileButtonText}>View Details</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    } else if (item.type === "video") {
      return (
        <View style={item.userName === user.name ? styles.selfMessageContent : styles.receivedMessageContent}>
          <Text style={styles.messageText}>Shared a video: {item.fileName}</Text>
          <Video
            source={{ uri: item.fileUri }}
            rate={1.0}
            volume={1.0}
            isMuted={false}
            resizeMode="cover"
            shouldPlay={false}
            useNativeControls
            style={styles.videoPlayer}
            onError={(error) => console.error("Video error:", error)}
          />
          <View style={styles.fileActionButtons}>
            <TouchableOpacity style={styles.fileButton} onPress={() => downloadFile(item.fileUri)}>
              <Icon name="download-outline" size={18} color="white" />
              <Text style={styles.fileButtonText}>Download</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.fileButton} onPress={() => viewFile(item.fileUri)}>
              <Icon name="eye-outline" size={18} color="white" />
              <Text style={styles.fileButtonText}>View</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    } else {
      return (
        <View style={item.userName === user.name ? styles.selfMessageContent : styles.receivedMessageContent}>
          <Text style={styles.messageText}>{item.text}</Text>
        </View>
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Chat Room</Text>
        <View style={styles.connectionStatus}>
          <View style={[styles.statusDot, { backgroundColor: isConnected ? "#4CAF50" : "#F44336" }]} />
          <Text style={styles.statusText}>{isConnected ? "Connected" : "Disconnected"}</Text>
        </View>
      </View>
      
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id || item.timestamp || Math.random().toString()}
        renderItem={({ item }) => renderMessage(item)}
      />
      
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type your message..."
            value={message}
            onChangeText={setMessage}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendButton, !message.trim() && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={!message.trim()}
          >
            <Icon name="send" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
      
      <Modal
        visible={imageViewerVisible}
        transparent={true}
        onRequestClose={() => setImageViewerVisible(false)}
        animationType="fade"
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.modalCloseButton} onPress={() => setImageViewerVisible(false)}>
            <Icon name="close-circle" size={36} color="white" />
          </TouchableOpacity>
          {selectedImage && (
            <Image source={{ uri: selectedImage }} style={styles.fullSizeImage} resizeMode="contain" />
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", padding: 16 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    marginBottom: 16,
  },
  title: { fontSize: 22, fontWeight: "bold" },
  connectionStatus: { flexDirection: "row", alignItems: "center" },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  statusText: { fontSize: 14, color: "#757575" },
  messageContainer: {
    marginBottom: 16,
    maxWidth: "80%",
    alignSelf: "flex-start",
    // Chat bubble container styling
    padding: 8,
    borderRadius: 12,
    backgroundColor: "#e1ffc7", // Light green for received messages
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  selfMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#cfe9ff", // Light blue for own messages
  },
  receivedMessage: {
    alignSelf: "flex-start",
  },
  messageContentContainer: { marginBottom: 4 },
  selfMessageContent: { backgroundColor: "#0084FF", borderRadius: 12, padding: 8 },
  receivedMessageContent: { backgroundColor: "#6200ee", borderRadius: 12, padding: 8 },
  messageText: { color: "white", fontSize: 16 },
  thumbnailImage: { width: 200, height: 150, borderRadius: 8, marginVertical: 8 },
  fileActionButtons: { flexDirection: "row", justifyContent: "space-around", marginTop: 8 },
  fileButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    padding: 6,
    borderRadius: 12,
    justifyContent: "center",
  },
  fileButtonText: { color: "white", fontSize: 14, marginLeft: 4 },
  messageFooter: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  messageProfileImage: { width: 20, height: 20, borderRadius: 10, marginRight: 5 },
  userName: { fontWeight: "bold", fontSize: 12, color: "#424242", marginRight: 5 },
  timestamp: { fontSize: 10, color: "#9E9E9E" },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 24,
    padding: 8,
    marginBottom: Platform.OS === "ios" ? 50 : 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: "#6200ee",
    padding: 10,
    borderRadius: 24,
    marginLeft: 8,
    marginRight: 4,
  },
  sendButtonDisabled: { backgroundColor: "#B39DDB" },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCloseButton: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 1,
  },
  fullSizeImage: { width: "90%", height: "80%" },
  meetingDetails: { marginTop: 8, marginBottom: 8 },
  meetingTime: { color: "white", fontSize: 14, marginBottom: 4 },
  meetingLocation: { color: "white", fontSize: 14, marginBottom: 4 },
  meetingRecurring: { color: "white", fontSize: 14, fontStyle: "italic" },
  videoPlayer: { width: 300, height: 200, borderRadius: 8, backgroundColor: "black", marginVertical: 8 },
});

export default ChatPage;
