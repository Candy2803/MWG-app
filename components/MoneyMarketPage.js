import React, { useState } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";

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
        "http://192.168.1.201:4000/upload",
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
    <View style={styles.container}>
      <Text style={styles.title}>PDF Uploader</Text>

      <Button
        title="Select PDF Document"
        onPress={pickDocument}
        disabled={isLoading}
      />

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.loadingText}>Uploading PDF...</Text>
        </View>
      )}

      {uploadedFileUrl && (
        <View style={styles.resultContainer}>
          <Text style={styles.successText}>Upload Successful!</Text>
          <Text style={styles.urlLabel}>PDF URL:</Text>
          <TouchableOpacity onPress={openPDF}>
            <Text style={styles.linkText}>{uploadedFileUrl}</Text>
          </TouchableOpacity>

          <View style={styles.buttonContainer}>
            <Button title="View PDF" onPress={openPDF} color="#0066cc" />

            <Button
              title="Share to Chat"
              onPress={shareToChat}
              color="#6200ee"
            />
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  loadingContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  resultContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#e6f7ff",
    borderRadius: 8,
    width: "100%",
  },
  successText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0066cc",
    marginBottom: 10,
  },
  urlLabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  linkText: {
    fontSize: 14,
    color: "#0066cc",
    textDecorationLine: "underline",
    marginBottom: 15,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
});

export default MoneyMarketPage;
