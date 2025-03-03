import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../Auth/AuthContext";

const Reports = () => {
  const navigation = useNavigation();
  const { logout } = useAuth();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Admin Dashboard - Reports</Text>
      </View>

      <View style={styles.sectionContainer}>
        <TouchableOpacity
          style={styles.itemButton}
          onPress={() => navigation.navigate("MeetingDocuments")}
        >
          <Text style={styles.itemText}>Meetings</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.itemButton}
          onPress={() => navigation.navigate("UpcomingEvents")}
        >
          <Text style={styles.itemText}>Upcoming Events</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.itemButton}
          onPress={() => navigation.navigate("MoneyMarketStatements")}
        >
          <Text style={styles.itemText}>Money Market Account Statements</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
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
  sectionContainer: {
    marginTop: 20,
  },
  itemButton: {
    backgroundColor: "#6200ee",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginVertical: 10,
    alignItems: "center",
  },
  itemText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  logoutButton: {
    backgroundColor: "#e74c3c",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginTop: 20,
    alignSelf: "center",
  },
  logoutButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default Reports;
