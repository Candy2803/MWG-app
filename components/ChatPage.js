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
  StatusBar,
  SafeAreaView,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useAuth } from "../Auth/AuthContext";
import socket from "../socket"; // Shared socket instance
import * as FileSystem from "expo-file-system";
import * as WebBrowser from "expo-web-browser";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRoute, useFocusEffect } from "@react-navigation/native";
import { Video } from "expo-av";
import { BlurView } from "expo-blur"; // You'll need to install this: expo install expo-blur

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
        // Prevent duplicate messages
        if (prev.find((msg) => msg.id === newMessage.id)) {
          return prev;
        }
        return [...prev, newMessage];
      });
    };
  
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    // Change "messageHistory" to "existingMessages" to match server
    socket.on("existingMessages", (existingMsgs) => {
      console.log("Received existing messages:", existingMsgs);
      setMessages(existingMsgs);
    });
    socket.on("message", handleMessageReceived);
    
    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("existingMessages");
      socket.off("message", handleMessageReceived);
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

  // Group messages by date
  const groupMessagesByDate = () => {
    const grouped = {};
    messages.forEach(msg => {
      const date = new Date(msg.timestamp);
      const dateStr = date.toLocaleDateString();
      if (!grouped[dateStr]) {
        grouped[dateStr] = [];
      }
      grouped[dateStr].push(msg);
    });
    
    // Convert to format for SectionList
    return Object.keys(grouped).map(date => ({
      title: date,
      data: grouped[date]
    }));
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
    const messageDate = new Date(item.timestamp);
    const isToday = new Date().toDateString() === messageDate.toDateString();
    const isYesterday = new Date(Date.now() - 86400000).toDateString() === messageDate.toDateString();
    const displayDate = isToday ? 'Today' : (isYesterday ? 'Yesterday' : messageDate.toLocaleDateString());

    return (
      <TouchableOpacity 
        activeOpacity={0.8}
        onLongPress={() => handleLongPressMessage(item.id, isMyMessage)}
      >
        <View style={[
          styles.messageContainer, 
          isMyMessage ? styles.selfMessage : styles.receivedMessage
        ]}>
          {!isMyMessage && (
            <Image 
              source={{ uri: item.profileImage || 'https://via.placeholder.com/40' }} 
              style={styles.avatarImage} 
            />
          )}
          <View style={[
            styles.messageBubble,
            isMyMessage ? styles.selfMessageBubble : styles.receivedMessageBubble
          ]}>
            {!isMyMessage && (
              <Text style={styles.senderName}>{item.userName}</Text>
            )}
            {renderMessageContent(item, isMyMessage)}
            <Text style={styles.timestamp}>
              {formatTimestamp(item.timestamp)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderMessageContent = (item, isMyMessage) => {
    if (item.type === "image") {
      return (
        <View>
          <Text style={styles.messageText}>Shared an image: {item.fileName}</Text>
          <TouchableOpacity onPress={() => viewImage(item.fileUri)}>
            <Image 
              source={{ uri: item.fileUri }} 
              style={styles.thumbnailImage} 
              resizeMode="cover" 
            />
          </TouchableOpacity>
          <View style={styles.fileActionButtons}>
            <TouchableOpacity 
              style={[styles.fileButton, isMyMessage ? styles.selfFileButton : styles.receivedFileButton]} 
              onPress={() => downloadFile(item.fileUri)}
            >
              <Icon name="download-outline" size={16} color="white" />
              <Text style={styles.fileButtonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.fileButton, isMyMessage ? styles.selfFileButton : styles.receivedFileButton]} 
              onPress={() => viewImage(item.fileUri)}
            >
              <Icon name="expand-outline" size={16} color="white" />
              <Text style={styles.fileButtonText}>View</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    } else if (item.type === "file") {
      return (
        <View>
          <View style={styles.filePreview}>
            <Icon name="document-outline" size={24} color={isMyMessage ? "#fff" : "#fff"} />
            <Text style={styles.messageText}>
              {item.fileName}
            </Text>
          </View>
          <View style={styles.fileActionButtons}>
            <TouchableOpacity 
              style={[styles.fileButton, isMyMessage ? styles.selfFileButton : styles.receivedFileButton]} 
              onPress={() => downloadFile(item.fileUri)}
            >
              <Icon name="download-outline" size={16} color="white" />
              <Text style={styles.fileButtonText}>Download</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.fileButton, isMyMessage ? styles.selfFileButton : styles.receivedFileButton]} 
              onPress={() => viewFile(item.fileUri)}
            >
              <Icon name="eye-outline" size={16} color="white" />
              <Text style={styles.fileButtonText}>View</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    } else if (item.type === "meeting") {
      return (
        <View>
          <View style={styles.meetingHeader}>
            <Icon name="calendar" size={20} color={isMyMessage ? "#fff" : "#fff"} />
            <Text style={styles.meetingTitle}>{item.title}</Text>
          </View>
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
            <TouchableOpacity 
              style={[styles.fileButton, isMyMessage ? styles.selfFileButton : styles.receivedFileButton]} 
              onPress={() => Alert.alert("Meeting Details", item.icalString)}
            >
              <Icon name="calendar-outline" size={16} color="white" />
              <Text style={styles.fileButtonText}>View Details</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    } else if (item.type === "video") {
      return (
        <View>
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
            <TouchableOpacity 
              style={[styles.fileButton, isMyMessage ? styles.selfFileButton : styles.receivedFileButton]} 
              onPress={() => downloadFile(item.fileUri)}
            >
              <Icon name="download-outline" size={16} color="white" />
              <Text style={styles.fileButtonText}>Download</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.fileButton, isMyMessage ? styles.selfFileButton : styles.receivedFileButton]} 
              onPress={() => viewFile(item.fileUri)}
            >
              <Icon name="eye-outline" size={16} color="white" />
              <Text style={styles.fileButtonText}>View</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    } else {
      return (
        <Text style={styles.messageText}>{item.text}</Text>
      );
    }
  };

  const renderDateSeparator = (date) => {
    const messageDate = new Date(date);
    const isToday = new Date().toDateString() === messageDate.toDateString();
    const isYesterday = new Date(Date.now() - 86400000).toDateString() === messageDate.toDateString();
    const displayDate = isToday ? 'Today' : (isYesterday ? 'Yesterday' : messageDate.toLocaleDateString());
    
    return (
      <View style={styles.dateSeparator}>
        <View style={styles.dateLine} />
        <Text style={styles.dateText}>{displayDate}</Text>
        <View style={styles.dateLine} />
      </View>
    );
  };

  // Group messages by date for display
  const messagesByDate = groupMessagesByDate().sort((a, b) => new Date(a.title) - new Date(b.title));
  
  // Function to determine if we need to show date separator
  const shouldShowDateSeparator = (item, index, data) => {
    if (index === 0) return true;
    
    const currentDate = new Date(item.timestamp).toDateString();
    const prevDate = new Date(data[index - 1].timestamp).toDateString();
    
    return currentDate !== prevDate;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Chat Room</Text>
          <View style={styles.connectionStatus}>
            <View style={[
              styles.statusDot, 
              { backgroundColor: isConnected ? "#4CAF50" : "#F44336" }
            ]} />
            <Text style={styles.statusText}>
              {isConnected ? "Connected" : "Disconnected"}
            </Text>
          </View>
        </View>
        
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id || item.timestamp || Math.random().toString()}
          renderItem={({ item, index }) => {
            // Check if we need a date separator
            const showDateSeparator = shouldShowDateSeparator(item, index, messages);
            
            return (
              <>
                {showDateSeparator && renderDateSeparator(item.timestamp)}
                {renderMessage(item)}
              </>
            );
          }}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
        />
        
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        >
          <View style={styles.inputContainer}>
            <TouchableOpacity style={styles.attachButton}>
              <Icon name="add-circle-outline" size={24} color="#6200ee" />
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              placeholder="Type your message..."
              value={message}
              onChangeText={setMessage}
              multiline
              maxLength={500}
              placeholderTextColor="#9E9E9E"
            />
            <TouchableOpacity
              style={[
                styles.sendButton, 
                !message.trim() && styles.sendButtonDisabled
              ]}
              onPress={sendMessage}
              disabled={!message.trim()}
            >
              <Icon name="send" size={20} color="white" />
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
            <BlurView intensity={90} style={StyleSheet.absoluteFill} tint="dark" />
            <TouchableOpacity 
              style={styles.modalCloseButton} 
              onPress={() => setImageViewerVisible(false)}
            >
              <Icon name="close-circle" size={36} color="white" />
            </TouchableOpacity>
            {selectedImage && (
              <Image 
                source={{ uri: selectedImage }} 
                style={styles.fullSizeImage} 
                resizeMode="contain" 
              />
            )}
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  container: { 
    flex: 1, 
    backgroundColor: "#F8F9FA", 
    padding: 0 
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
    backgroundColor: "#FFFFFF",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  title: { 
    fontSize: 20, 
    fontWeight: "bold",
    color: "#212121" 
  },
  connectionStatus: { 
    flexDirection: "row", 
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusDot: { 
    width: 8, 
    height: 8, 
    borderRadius: 4, 
    marginRight: 6 
  },
  statusText: { 
    fontSize: 12, 
    fontWeight: "500",
    color: "#616161" 
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  dateSeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dateLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dateText: {
    paddingHorizontal: 10,
    fontSize: 12,
    color: '#9E9E9E',
    fontWeight: '600',
  },
  messageContainer: {
    flexDirection: "row",
    marginBottom: 16,
    maxWidth: "80%",
  },
  avatarImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 8,
    alignSelf: 'flex-start',
  },
  messageBubble: {
    borderRadius: 16,
    padding: 12,
    maxWidth: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  selfMessage: {
    alignSelf: "flex-end",
    justifyContent: 'flex-end',
  },
  receivedMessage: {
    alignSelf: "flex-start",
    justifyContent: 'flex-start',
  },
  selfMessageBubble: {
    backgroundColor: "lightblue",
    borderTopRightRadius: 2,
  },
  receivedMessageBubble: {
    backgroundColor: "lightgrey",
    borderTopLeftRadius: 2,
  },
  senderName: {
    fontSize: 13,
    fontWeight: "bold",
    color: "blue",
    marginBottom: 4,
  },
  messageText: { 
    color: "#000", 
    fontSize: 16,
    lineHeight: 22,
  },
  selfFileButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  receivedFileButton: {
    backgroundColor: "rgba(0, 0, 0, 0.08)",
  },
  thumbnailImage: { 
    width: 200, 
    height: 150, 
    borderRadius: 8, 
    marginVertical: 8,
    backgroundColor: "#E0E0E0",
  },
  filePreview: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },
  fileActionButtons: { 
    flexDirection: "row", 
    justifyContent: "flex-start", 
    marginTop: 8,
    gap: 8,
  },
  fileButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    justifyContent: "center",
  },
  fileButtonText: { 
    color: "white", 
    fontSize: 12, 
    marginLeft: 4,
    fontWeight: "500",
  },
  timestamp: { 
    fontSize: 10, 
    color: "blue",
    alignSelf: "flex-end",
    marginTop: 4,
  },
  meetingHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  meetingTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 6,
  },
  meetingDetails: { 
    marginBottom: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    padding: 8,
    borderRadius: 8,
  },
  meetingTime: { 
    color: "#FFFFFF", 
    fontSize: 13, 
    marginBottom: 4 
  },
  meetingLocation: { 
    color: "#FFFFFF", 
    fontSize: 13, 
    marginBottom: 4 
  },
  meetingRecurring: { 
    color: "#FFFFFF", 
    fontSize: 13, 
    fontStyle: "italic" 
  },
  videoPlayer: { 
    width: 240, 
    height: 160, 
    borderRadius: 8, 
    backgroundColor: "#212121", 
    marginVertical: 8 
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginHorizontal: 16,
    marginBottom: Platform.OS === "ios" ? 40 : 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#EEEEEE",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  attachButton: {
    padding: 8,
  },
  input: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
    color: "#212121",
  },
  sendButton: {
    backgroundColor: "#6200EE",
    padding: 10,
    borderRadius: 20,
    marginLeft: 8,
  },
  sendButtonDisabled: { 
    backgroundColor: "#DADCE0",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalCloseButton: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 1,
  },
  fullSizeImage: { 
    width: "90%", 
    height: "80%",
    borderRadius: 8,
  },
});

export default ChatPage;