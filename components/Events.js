import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
  ActivityIndicator,
  TextInput,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../Auth/AuthContext";
import Icon from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import io from "socket.io-client";
import axios from "axios";

// Use the same socket connection as ChatPage
const socket = io("https://mwg-app-api.vercel.app/");

const Events = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [eventTitle, setEventTitle] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [isConnected, setIsConnected] = useState(false);

  // Check if user is admin
  const isAdmin = user && user.role === "admin";

  // Connect to socket server
  useEffect(() => {
    if (socket.connected) {
      setIsConnected(true);
    } else {
      socket.connect();
    }

    const handleConnect = () => {
      console.log("Connected to socket server from AdminEvents");
      setIsConnected(true);
    };

    const handleDisconnect = () => {
      console.log("Disconnected from socket server from AdminEvents");
      setIsConnected(false);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
    };
  }, []);

  // Load events from storage on mount
  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const storedEvents = await AsyncStorage.getItem("events");
      if (storedEvents) {
        setEvents(JSON.parse(storedEvents));
      }
      setLoading(false);
    } catch (error) {
      console.error("Error loading events:", error);
      setLoading(false);
      Alert.alert("Error", "Failed to load events.");
    }
  };

  const saveEvents = async (updatedEvents) => {
    try {
      await AsyncStorage.setItem("events", JSON.stringify(updatedEvents));
    } catch (error) {
      console.error("Error saving events:", error);
      Alert.alert("Error", "Failed to save events.");
    }
  };

  const pickImage = async () => {
    if (!isAdmin) {
      Alert.alert("Permission Denied", "Only admins can upload event images.");
      return;
    }

    if (!eventTitle.trim()) {
      Alert.alert("Error", "Please enter an event title before uploading an image.");
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "We need camera roll permissions to upload images.");
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];
        uploadMedia(selectedImage.uri, "image");
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image.");
    }
  };

  const pickVideo = async () => {
    if (!isAdmin) {
      Alert.alert("Permission Denied", "Only admins can upload event videos.");
      return;
    }

    if (!eventTitle.trim()) {
      Alert.alert("Error", "Please enter an event title before uploading a video.");
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "We need camera roll permissions to upload videos.");
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedVideo = result.assets[0];
        uploadMedia(selectedVideo.uri, "video");
      }
    } catch (error) {
      console.error("Error picking video:", error);
      Alert.alert("Error", "Failed to pick video.");
    }
  };

  const uploadMedia = async (uri, type) => {
    if (!uri) return;
  
    try {
      setUploading(true);
      const formData = new FormData();
  
      // Determine field name based on type
      const fieldName = type === "image" ? "image" : "video";
  
      formData.append(fieldName, {
        uri,
        name: `event_${Date.now()}.${type === "image" ? "jpg" : "mp4"}`,
        type: type === "image" ? "image/jpeg" : "video/mp4",
      });
  
      // Use a different endpoint for videos if type is "video"
      const uploadEndpoint =
        type === "video"
          ? "https://mwg-app-api.vercel.app/uploadVideo"
          : "https://mwg-app-api.vercel.app/uploadImage";
  
      const response = await axios.post(uploadEndpoint, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
  
      // Assume response.data.url contains the Cloudinary URL
      const serverUrl = response.data.url;
      console.log("Upload response:", response.data);
  
      // Create a new event object
      const newEvent = {
        id: Date.now().toString(),
        title: eventTitle,
        description: eventDescription,
        ...(type === "image" ? { imageUri: serverUrl } : { videoUri: serverUrl }),
        fileName: `event_${Date.now()}.${type === "image" ? "jpg" : "mp4"}`,
        timestamp: new Date().toISOString(),
        createdBy: user.name,
      };
  
      const updatedEvents = [...events, newEvent];
      setEvents(updatedEvents);
      saveEvents(updatedEvents);
  
      setEventTitle("");
      setEventDescription("");
      setUploading(false);
  
      Alert.alert("Success", `${type === "image" ? "Image" : "Video"} uploaded successfully.`);
    } catch (error) {
      console.error("Error uploading media:", error.response || error);
      setUploading(false);
      Alert.alert("Error", "Failed to upload media: " + error.message);
    }
  };
  
  const shareEventToChat = (event) => {
    if (!isConnected) {
      Alert.alert("Error", "Not connected to chat server.");
      return;
    }

    // Pass the media URL (either imageUri or videoUri) to ChatPage.
    const fileUrl = event.imageUri || event.videoUri;
    const fileName = event.imageUri ? `Event: ${event.title}` : `Video: ${event.title}`;

    navigation.navigate("ChatPage", {
      fileUrl,
      fileName,
    });
  };

  const deleteEvent = async (eventId) => {
    if (!isAdmin) {
      Alert.alert("Permission Denied", "Only admins can delete events.");
      return;
    }

    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this event?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const updatedEvents = events.filter(event => event.id !== eventId);
              setEvents(updatedEvents);
              await saveEvents(updatedEvents);
            } catch (error) {
              console.error("Error deleting event:", error);
              Alert.alert("Error", "Failed to delete event.");
            }
          }
        }
      ]
    );
  };

  const renderEvent = ({ item }) => (
    <View style={styles.eventCard}>
      <View style={styles.eventHeader}>
        <Text style={styles.eventTitle}>{item.title}</Text>
        {isAdmin && (
          <TouchableOpacity onPress={() => deleteEvent(item.id)}>
            <Icon name="trash-outline" size={24} color="#FF5252" />
          </TouchableOpacity>
        )}
      </View>

      {item.description ? (
        <Text style={styles.eventDescription}>{item.description}</Text>
      ) : null}

      {item.imageUri ? (
        <Image 
          source={{ uri: item.imageUri }} 
          style={styles.eventImage}
          resizeMode="cover"
        />
      ) : null}

      {item.videoUri ? (
        <View style={styles.videoPlaceholder}>
          <Icon name="play-circle-outline" size={64} color="#BDBDBD" />
          <Text style={styles.videoLabel}>Video</Text>
        </View>
      ) : null}

      <View style={styles.eventFooter}>
        <Text style={styles.eventTimestamp}>
          {new Date(item.timestamp).toLocaleDateString()} by {item.createdBy}
        </Text>
        <TouchableOpacity 
          style={styles.shareButton}
          onPress={() => shareEventToChat(item)}
        >
          <Icon name="share-social-outline" size={18} color="white" />
          <Text style={styles.shareButtonText}>Share to Chat</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Events</Text>
        <View style={styles.connectionStatus}>
          <View style={[styles.statusDot, { backgroundColor: isConnected ? "#4CAF50" : "#F44336" }]} />
          <Text style={styles.statusText}>{isConnected ? "Connected" : "Disconnected"}</Text>
        </View>
      </View>

      {isAdmin && (
        <View style={styles.uploadSection}>
          <Text style={styles.sectionTitle}>Create New Event</Text>
          <TextInput
            style={styles.input}
            placeholder="Event Title"
            value={eventTitle}
            onChangeText={setEventTitle}
            maxLength={50}
          />
          <TextInput
            style={[styles.input, styles.multilineInput]}
            placeholder="Event Description (optional)"
            value={eventDescription}
            onChangeText={setEventDescription}
            multiline
            numberOfLines={3}
            maxLength={200}
          />
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={styles.uploadButton} 
              onPress={pickImage}
              disabled={uploading}
            >
              {uploading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <>
                  <Icon name="image-outline" size={24} color="white" />
                  <Text style={styles.uploadButtonText}>Upload Image</Text>
                </>
              )}
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.uploadButton, { backgroundColor: "#007AFF" }]} 
              onPress={pickVideo}
              disabled={uploading}
            >
              {uploading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <>
                  <Icon name="videocam-outline" size={24} color="white" />
                  <Text style={styles.uploadButtonText}>Upload Video</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {loading ? (
        <ActivityIndicator size="large" color="#6200ee" style={styles.loader} />
      ) : (
        <FlatList
          data={events}
          renderItem={renderEvent}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.eventsList}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Icon name="calendar-outline" size={64} color="#BDBDBD" />
              <Text style={styles.emptyStateText}>No events yet</Text>
              {isAdmin && (
                <Text style={styles.emptyStateSubtext}>
                  Upload an event image or video to get started
                </Text>
              )}
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
  },
  connectionStatus: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    color: "#757575",
  },
  uploadSection: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  input: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  multilineInput: {
    height: 80,
    textAlignVertical: "top",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  uploadButton: {
    backgroundColor: "#6200ee",
    borderRadius: 8,
    padding: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flex: 0.48,
  },
  uploadButtonText: {
    color: "white",
    fontWeight: "bold",
    marginLeft: 8,
  },
  eventsList: {
    paddingBottom: 20,
  },
  eventCard: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  eventHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
  },
  eventDescription: {
    fontSize: 14,
    color: "#616161",
    marginBottom: 12,
  },
  eventImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  videoPlaceholder: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  videoLabel: {
    color: "#fff",
    fontSize: 18,
    marginTop: 8,
  },
  eventFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  eventTimestamp: {
    fontSize: 12,
    color: "#757575",
  },
  shareButton: {
    backgroundColor: "#6200ee",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
  },
  shareButtonText: {
    color: "white",
    fontSize: 14,
    marginLeft: 4,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#757575",
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#9E9E9E",
    marginTop: 8,
    textAlign: "center",
  },
  loader: {
    marginTop: 40,
  },
});

export default Events;
