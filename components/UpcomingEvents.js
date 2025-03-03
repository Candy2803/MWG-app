import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, Alert } from "react-native";

const UpcomingEvents = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [eventTitle, setEventTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventPurpose, setEventPurpose] = useState("");
  const [eventInvites, setEventInvites] = useState("");

  const handleSubmit = () => {
    if (eventTitle && eventDate && eventPurpose && eventInvites) {
      Alert.alert("Success", "Event posted successfully!");
      setModalVisible(false);
    } else {
      Alert.alert("Error", "Please fill in all fields.");
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.openModalButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.openModalButtonText}>Post Upcoming Event</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Post Event Details</Text>
            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Event Title"
              value={eventTitle}
              onChangeText={setEventTitle}
            />
            <Text style={styles.label}>Date</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Event Date"
              value={eventDate}
              onChangeText={setEventDate}
            />
            <Text style={styles.label}>Purpose</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Event Purpose"
              value={eventPurpose}
              onChangeText={setEventPurpose}
            />
            <Text style={styles.label}>Invites</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Invites"
              value={eventInvites}
              onChangeText={setEventInvites}
            />
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
            >
              <Text style={styles.submitButtonText}>Post Event</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeModalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f0f0f5",
  },
  openModalButton: {
    backgroundColor: "#6200ee",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
    alignSelf: "center",
  },
  openModalButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    color: "black",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    color: "#000",
  },
  submitButton: {
    backgroundColor: "#6200ee",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
    alignSelf: "center",
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  closeModalButton: {
    backgroundColor: "#e74c3c",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginTop: 20,
    alignSelf: "center",
  },
  closeModalButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default UpcomingEvents;
