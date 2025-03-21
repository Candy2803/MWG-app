import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Image,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useAuth } from "../Auth/AuthContext";
import socket from "../socket";
import * as FileSystem from "expo-file-system";
import * as WebBrowser from "expo-web-browser";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRoute, useFocusEffect } from "@react-navigation/native";
import { Video } from "expo-av";
import { BlurView } from "expo-blur";
import Icon from "react-native-vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
// Get window dimensions
const { width } = Dimensions.get("window");

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const ChatPage = ({ navigation }) => {
  const route = useRoute();
  const { fileUrl, fileName, event } = route.params || {};
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [fileShared, setFileShared] = useState(false);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [expoPushToken, setExpoPushToken] = useState("");
  const notificationListener = useRef();
  const responseListener = useRef();
  const flatListRef = useRef();
  

  // Setup notifications - Keep this simple
  useEffect(() => {
    async function setupNotifications() {
      // Configure notification handler
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      });

      // Setup Android channel
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#6200EE',
        });
      }

      // Request permissions
      if (Device.isDevice) {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') {
          console.log('Notification permissions not granted');
          return;
        }
      }

      // Add listeners
      notificationListener.current = Notifications.addNotificationReceivedListener(
        notification => console.log('Notification received:', notification)
      );
      
      responseListener.current = Notifications.addNotificationResponseReceivedListener(
        response => console.log('Notification response:', response)
      );
    }

    setupNotifications();

    // Cleanup
    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  // Simple local notification function that doesn't use any hooks
  const scheduleNotification = (title, body) => {
    try {
      Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: true,
        },
        trigger: null,
      });
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  };

  // Your existing code continues...

  // Helper: Generate unique IDs for messages
  const generateUniqueId = () =>
    `${Date.now()}-${Math.floor(Math.random() * 1000)}`;

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

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current.scrollToEnd({ animated: true });
      }, 200);
    }
  }, [messages]);

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
    }
    const handleMessageReceived = (newMessage) => {
      console.log("ChatPage received message:", newMessage);
      setMessages((prev) => {
        if (prev.find((msg) => msg.id === newMessage.id)) return prev;
    
        if (newMessage.userName !== user.name) {
          scheduleNotification(
            `New message from ${newMessage.userName}`,
            newMessage.text
          );
        }
        return [...prev, newMessage];
      });
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
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

  // On focus, if file or event params exist, share file or event (only once)
  useFocusEffect(
    React.useCallback(() => {
      if (fileUrl && isConnected && !fileShared) {
        console.log("Sharing file to chat:", fileUrl);
        shareFileToChat(fileUrl, fileName || "shared-document.pdf");
        setFileShared(true);
      }
      if (event && isConnected && !fileShared) {
        console.log("Sharing event to chat:", event);
        shareEventToChat(event);
        setFileShared(true);
      }
    }, [fileUrl, event, isConnected, fileShared])
  );

  // Send text message
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

  // Share a file (image, video, or generic file)
  const shareFileToChat = (fileUri, fileName) => {
    if (!fileUri) return;
    const fileExtension = fileUri.split(".").pop().toLowerCase();
    const isImage = ["jpg", "jpeg", "png", "gif", "webp"].includes(
      fileExtension
    );
    const type = isImage ? "image" : fileExtension === "mp4" ? "video" : "file";
    const fileMsg = {
      id: generateUniqueId(),
      type,
      fileUri,
      fileName: fileName || fileUri.split("/").pop(),
      userName: user.name,
      profileImage: user.profileImage,
      timestamp: new Date().toISOString(),
      text: `${user.name} shared ${
        isImage ? "an image" : type === "video" ? "a video" : "a file"
      }: ${fileName || fileUri.split("/").pop()}`,
    };
    console.log("Emitting file message:", fileMsg);
    socket.emit("sendMessage", fileMsg);
    setMessages((prev) => [...prev, fileMsg]);
  };

  // Share an event (full details: title, description, and image)
  const shareEventToChat = (eventObj) => {
    if (!isConnected) {
      Alert.alert("Error", "Not connected to chat server.");
      return;
    }
    const eventMsg = {
      id: generateUniqueId(),
      type: "event",
      eventTitle: eventObj.title,
      eventDescription: eventObj.description,
      eventImage: eventObj.imageUri,
      userName: user.name,
      profileImage: user.profileImage,
      timestamp: new Date().toISOString(),
      text: `${user.name} shared an event: ${eventObj.title}\n${eventObj.description}`,
    };
    console.log("Emitting event message:", eventMsg);
    socket.emit("sendMessage", eventMsg);
    setMessages((prev) => [...prev, eventMsg]);
  };

  // Download file using Expo FileSystem
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

  // Open a file/URL using Expo WebBrowser
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
          Alert.alert(
            "Invalid URL",
            "URL must start with http://, https://, or file://"
          );
        }
        return;
      }
      await WebBrowser.openBrowserAsync(uri);
    } catch (error) {
      console.error("Error opening file:", error);
      Alert.alert("Error", "Issue opening file: " + error.message);
    }
  };

  // Open an image in full-screen view
  const viewImage = (uri) => {
    setSelectedImage(uri);
    setImageViewerVisible(true);
  };

  // Format timestamp for messages
  const formatTimestamp = (timestamp) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return timestamp;
    }
  };

  // Render a date separator
  const renderDateSeparator = (timestamp) => {
    const date = new Date(timestamp);
    const isToday = new Date().toDateString() === date.toDateString();
    const isYesterday =
      new Date(Date.now() - 86400000).toDateString() === date.toDateString();
    const displayDate = isToday
      ? "Today"
      : isYesterday
      ? "Yesterday"
      : date.toLocaleDateString();
    return (
      <View style={styles.dateSeparator}>
        <View style={styles.dateLine} />
        <Text style={styles.dateText}>{displayDate}</Text>
        <View style={styles.dateLine} />
      </View>
    );
  };

  // Render a chat message bubble
  const renderMessage = (item) => {
    const isMyMessage = item.userName === user.name;
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onLongPress={() => {
          Alert.alert("Message Options", "What would you like to do?", [
            { text: "Copy", onPress: () => {} },
            { text: "Delete", onPress: () => {} },
            { text: "Cancel", style: "cancel" },
          ]);
        }}
      >
        <View
          style={[
            styles.messageContainer,
            isMyMessage ? styles.selfMessage : styles.receivedMessage,
          ]}
        >
          {!isMyMessage && (
            <Image
              source={{
                uri: item.profileImage || "https://via.placeholder.com/40",
              }}
              style={styles.avatarImage}
            />
          )}
          <View
            style={[
              styles.messageBubble,
              isMyMessage
                ? styles.selfMessageBubble
                : styles.receivedMessageBubble,
            ]}
          >
            {!isMyMessage && (
              <Text style={styles.senderName}>{item.userName}</Text>
            )}
            {/* Render message content based on type */}
            {item.type === "event" ? (
              <View style={styles.eventMessageContainer}>
                <Text style={styles.eventTitle}>{item.eventTitle}</Text>
                <Text style={styles.eventDescription}>
                  {item.eventDescription}
                </Text>
                {item.eventImage && (
                  <TouchableOpacity onPress={() => viewImage(item.eventImage)}>
                    <Image
                      source={{ uri: item.eventImage }}
                      style={styles.eventImage}
                    />
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <>
                {item.type === "image" ? (
                  <TouchableOpacity onPress={() => viewImage(item.fileUri)}>
                    <Image
                      source={{ uri: item.fileUri }}
                      style={styles.thumbnailImage}
                    />
                  </TouchableOpacity>
                ) : item.type === "file" ? (
                  <View style={styles.fileContainer}>
                    <Text style={styles.fileName}>
                      {item.fileName || "File"}
                    </Text>
                    <View style={styles.fileButtons}>
                      <TouchableOpacity
                        onPress={() => downloadFile(item.fileUri)}
                        style={styles.fileButton}
                      >
                        <Icon name="download-outline" size={16} color="#fff" />
                        <Text style={styles.fileButtonText}>Download</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => viewFile(item.fileUri)}
                        style={styles.fileButton}
                      >
                        <Icon name="eye-outline" size={16} color="#fff" />
                        <Text style={styles.fileButtonText}>View</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : item.type === "video" ? (
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
                ) : (
                  <Text style={styles.messageText}>{item.text}</Text>
                )}
              </>
            )}
            <Text style={styles.timestamp}>
              {formatTimestamp(item.timestamp)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#6200EE" />
      <View style={styles.container}>
        {/* Chat header with gradient */}
        <LinearGradient
          colors={["#6200EE", "#9D4EDD"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.header}
        >
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          ></TouchableOpacity>
          <Text style={styles.title}>Chat Room</Text>
          <View style={styles.connectionStatus}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: isConnected ? "#4CAF50" : "#F44336" },
              ]}
            />
            <Text style={styles.statusText}>
              {isConnected ? "Connected" : "Disconnected"}
            </Text>
          </View>
        </LinearGradient>

        {/* Chat messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) =>
            item.id || item.timestamp || Math.random().toString()
          }
          renderItem={({ item, index }) => {
            const showDateSeparator =
              index === 0 ||
              new Date(item.timestamp).toDateString() !==
                new Date(messages[index - 1].timestamp).toDateString();
            return (
              <>
                {showDateSeparator && renderDateSeparator(item.timestamp)}
                {renderMessage(item)}
              </>
            );
          }}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() =>
            flatListRef.current.scrollToEnd({ animated: true })
          }
          initialNumToRender={15}
        />

        {/* Floating scroll to bottom button */}
        {messages.length > 10 && (
          <TouchableOpacity
            style={styles.scrollBottomButton}
            onPress={() => flatListRef.current.scrollToEnd({ animated: true })}
          >
            <Icon name="arrow-down" size={24} color="#6200EE" />
          </TouchableOpacity>
        )}

        {/* Message input */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        >
          <View style={styles.inputContainer}>
            <TouchableOpacity style={styles.attachButton}>
              <Icon name="add-circle" size={24} color="#6200EE" />
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              placeholder="Type your message..."
              placeholderTextColor="#9E9E9E"
              value={message}
              onChangeText={(text) => setMessage(text || "")}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                !message.trim() && styles.sendButtonDisabled,
              ]}
              onPress={sendMessage}
              disabled={!message.trim()}
            >
              <LinearGradient
                colors={
                  message.trim()
                    ? ["#6200EE", "#9D4EDD"]
                    : ["#DADCE0", "#DADCE0"]
                }
                style={styles.sendButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Icon name="send" size={20} color="white" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>

        {/* Image viewer modal */}
        <Modal
          visible={imageViewerVisible}
          transparent={true}
          onRequestClose={() => setImageViewerVisible(false)}
          animationType="fade"
        >
          <View style={styles.modalContainer}>
            <BlurView
              intensity={90}
              style={StyleSheet.absoluteFill}
              tint="dark"
            />
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
    backgroundColor: "#F5F7FA",
  },
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
    padding: 0,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  connectionStatus: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#FFFFFF",
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  dateSeparator: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
  },
  dateLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E0E0E0",
  },
  dateText: {
    paddingHorizontal: 10,
    fontSize: 13,
    color: "#9E9E9E",
    fontWeight: "600",
  },
  messageContainer: {
    flexDirection: "row",
    marginBottom: 16,
    maxWidth: "75%",
  },
  avatarImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 8,
    alignSelf: "flex-start",
    borderWidth: 2,
    borderColor: "#FFF",
  },
  messageBubble: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxWidth: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  selfMessage: {
    alignSelf: "flex-end",
    justifyContent: "flex-end",
  },
  receivedMessage: {
    alignSelf: "flex-start",
    justifyContent: "flex-start",
  },
  selfMessageBubble: {
    backgroundColor: "#E6DBFF",
    borderBottomRightRadius: 4,
    borderTopRightRadius: 18,
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18,
  },
  receivedMessageBubble: {
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 4,
    borderTopRightRadius: 18,
    borderTopLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  senderName: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#6200EE",
    marginBottom: 4,
  },
  messageText: {
    color: "#212121",
    fontSize: 16,
    lineHeight: 22,
  },
  thumbnailImage: {
    width: 200,
    height: 150,
    borderRadius: 12,
    marginVertical: 8,
    backgroundColor: "#E0E0E0",
  },
  fileContainer: {
    backgroundColor: "#F3F4F6",
    padding: 12,
    borderRadius: 12,
    marginVertical: 4,
  },
  fileName: {
    fontSize: 14,
    marginBottom: 6,
    color: "#333",
    fontWeight: "500",
  },
  fileButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  fileButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#6200EE",
    padding: 8,
    paddingHorizontal: 10,
    borderRadius: 16,
    margin: 2,
  },
  fileButtonText: {
    color: "white",
    fontSize: 12,
    marginLeft: 4,
    fontWeight: "500",
  },
  videoPlayer: {
    width: 240,
    height: 160,
    borderRadius: 12,
    backgroundColor: "#212121",
    marginVertical: 8,
  },
  eventMessageContainer: {
    backgroundColor: "#FFF3E0",
    borderRadius: 12,
    padding: 12,
    marginVertical: 4,
    borderLeftWidth: 3,
    borderLeftColor: "#FF9800",
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#BF360C",
    marginBottom: 4,
  },
  eventDescription: {
    fontSize: 16,
    color: "#5D4037",
    marginBottom: 8,
  },
  eventImage: {
    width: width * 0.6,
    height: width * 0.4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginHorizontal: 16,
    marginBottom: Platform.OS === "ios" ? 30 : 12,
    marginTop: 8,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  attachButton: {
    padding: 8,
  },
  input: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
    color: "#212121",
    minHeight: 40,
  },
  sendButton: {
    borderRadius: 20,
    marginLeft: 8,
    overflow: "hidden",
  },
  sendButtonGradient: {
    padding: 10,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    opacity: 0.7,
  },
  timestamp: {
    fontSize: 10,
    color: "#9E9E9E",
    alignSelf: "flex-end",
    marginTop: 4,
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
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 20,
  },
  fullSizeImage: {
    width: "90%",
    height: "80%",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  scrollBottomButton: {
    position: "absolute",
    right: 16,
    bottom: 80,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
});

export default ChatPage;
