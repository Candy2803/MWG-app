import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import DocumentPicker from "react-native-document-picker"; 

const MeetingDocuments = () => {
  const navigation = useNavigation();

  const [documents, setDocuments] = useState([
    { id: 1, title: "Meeting Minutes - Jan 2025", url: "path_to_document_1.pdf" },
    { id: 2, title: "Meeting Minutes - Feb 2025", url: "path_to_document_2.pdf" },
    { id: 3, title: "Meeting Minutes - Mar 2025", url: "path_to_document_3.pdf" },
  ]);

  const handleDelete = (id) => {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete this document?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: () => {
            setDocuments(documents.filter((doc) => doc.id !== id));
            Alert.alert("Success", "Document deleted successfully.");
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleUpload = async () => {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.pdf], 
      });

      const newDoc = {
        id: documents.length + 1, 
        title: res.name,
        url: res.uri, 
      };

      setDocuments([...documents, newDoc]);

      Alert.alert("Success", "Document uploaded successfully.");
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        console.log("User canceled the document picker.");
      } else {
        console.error(err);
        Alert.alert("Error", "An error occurred while picking the file.");
      }
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Uploaded Meeting Documents</Text>
      </View>

      <View style={styles.documentListContainer}>
        {documents.length > 0 ? (
          documents.map((document) => (
            <View key={document.id} style={styles.documentItem}>
              <Text style={styles.documentTitle}>{document.title}</Text>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDelete(document.id)}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <Text style={styles.noDocumentsText}>No documents uploaded yet.</Text>
        )}
      </View>

      <TouchableOpacity
        style={styles.uploadButton}
        onPress={handleUpload} 
      >
        <Text style={styles.uploadButtonText}>Upload New Document</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#f0f0f5",
    padding: 20,
  },
  headerContainer: {
    backgroundColor: "#6200ee",
    paddingVertical: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  headerText: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  documentListContainer: {
    marginTop: 20,
  },
  documentItem: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  deleteButton: {
    backgroundColor: "#e74c3c",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  deleteButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  uploadButton: {
    backgroundColor: "#6200ee",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginTop: 20,
    alignSelf: "center",
  },
  uploadButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  noDocumentsText: {
    textAlign: "center",
    fontSize: 16,
    color: "#888",
  },
});

export default MeetingDocuments;
