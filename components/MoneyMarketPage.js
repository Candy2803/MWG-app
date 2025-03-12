import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
  SafeAreaView,
  Image,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";

const MoneyMarketPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFileUrl, setUploadedFileUrl] = useState(null);
  const navigation = useNavigation();

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        console.log("User cancelled document picker");
        return;
      }

      uploadPDF(result.assets[0]);
    } catch (error) {
      console.error("Error picking document:", error);
      Alert.alert("Error", "Failed to pick document");
    }
  };

  const uploadPDF = async (fileAsset) => {
    try {
      setIsLoading(true);

      // Create form data
      const formData = new FormData();
      formData.append("pdf", {
        uri: fileAsset.uri,
        name: fileAsset.name,
        type: "application/pdf",
      });

      // Upload to your server
      const response = await axios.post(
        "http://192.168.0.107:5000/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setUploadedFileUrl(response.data.url);
      Alert.alert("Success", "PDF uploaded successfully!");
    } catch (error) {
      console.error("Error uploading PDF:", error);
      Alert.alert("Error", "Failed to upload PDF");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to open the PDF URL in browser
  const openPDF = async () => {
    if (uploadedFileUrl) {
      try {
        const supported = await Linking.canOpenURL(uploadedFileUrl);

        if (supported) {
          await Linking.openURL(uploadedFileUrl);
        } else {
          Alert.alert("Error", "Cannot open this URL");
        }
      } catch (error) {
        console.error("Error opening URL:", error);
        Alert.alert("Error", "Failed to open PDF");
      }
    }
  };

  // Function to share the PDF to chat
  const shareToChat = () => {
    if (uploadedFileUrl) {
      navigation.push("ChatPage", {
        fileUrl: uploadedFileUrl,
        fileName: uploadedFileUrl.split("/").pop(), // Extract filename from URL
      });
    } else {
      Alert.alert("Error", "No file uploaded yet");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={['#f0f8ff', '#e6f7ff']}
        style={styles.container}
      >
        <View style={styles.headerContainer}>
          <Image 
            source={{ uri: "https://via.placeholder.com/50" }} 
            style={styles.logo} 
          />
          <Text style={styles.title}>Money Market Statements</Text>
        </View>

        <View style={styles.uploadCard}>
          <TouchableOpacity 
            style={styles.selectButton} 
            onPress={pickDocument}
            disabled={isLoading}
          >
            <Text style={styles.selectButtonText}>
              {isLoading ? "Processing..." : "Select PDF Document"}
            </Text>
          </TouchableOpacity>

          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4a80f5" />
              <Text style={styles.loadingText}>Uploading PDF...</Text>
            </View>
          )}
        </View>

        {uploadedFileUrl && (
          <View style={styles.resultContainer}>
            <View style={styles.successBadge}>
              <Text style={styles.successText}>Upload Complete</Text>
            </View>
            
            <Text style={styles.urlLabel}>PDF Location:</Text>
            <TouchableOpacity onPress={openPDF} style={styles.linkContainer}>
              <Text numberOfLines={1} ellipsizeMode="middle" style={styles.linkText}>
                {uploadedFileUrl}
              </Text>
            </TouchableOpacity>

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.actionButton} onPress={openPDF}>
                <Text style={styles.actionButtonText}>View PDF</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.actionButton, styles.shareButton]} onPress={shareToChat}>
                <Text style={styles.actionButtonText}>Share to Chat</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    paddingVertical: 10,
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#333",
  },
  uploadCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 25,
    marginBottom: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    alignItems: "center",
  },
  selectButton: {
    backgroundColor: "#4a80f5",
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 30,
    width: "100%",
    alignItems: "center",
  },
  selectButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingContainer: {
    marginTop: 25,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: "#666",
  },
  resultContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 25,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  successBadge: {
    backgroundColor: "#e6f7ff",
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginBottom: 15,
  },
  successText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0066cc",
  },
  urlLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#555",
  },
  linkContainer: {
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  linkText: {
    fontSize: 14,
    color: "#0066cc",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    flex: 1,
    backgroundColor: "#4a80f5",
    padding: 15,
    borderRadius: 30,
    alignItems: "center",
    marginRight: 10,
  },
  shareButton: {
    backgroundColor: "#6200ee",
    marginRight: 0,
    marginLeft: 10,
  },
  actionButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 15,
  },
});

export default MoneyMarketPage;