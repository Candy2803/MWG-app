import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../Auth/AuthContext";

const Reports = () => {
  const navigation = useNavigation();
  const { logout } = useAuth();

  const reportItems = [
    {
      title: "Meetings",
      icon: "📊",
      screen: "Meeting",
      color: "#4A6FFF"
    },
    {
      title: "Upcoming Events",
      icon: "🗓️",
      screen: "Events",
      color: "#FF6B6B"
    },
    {
      title: "Money Market Account Statements",
      icon: "💰",
      screen: "MoneyMarketPage",
      color: "#33C979"
    }
  ];

  return (
    <>
      <StatusBar backgroundColor="#5C00EA" barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.welcomeText}>Welcome Back</Text>
          <Text style={styles.headerText}>Admin Dashboard</Text>
          <Text style={styles.subHeaderText}>Reports & Analytics</Text>
        </View>

        <View style={styles.sectionContainer}>
          {reportItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.itemButton, { backgroundColor: item.color }]}
              onPress={() => navigation.navigate(item.screen)}
            >
              <Text style={styles.itemIcon}>{item.icon}</Text>
              <Text style={styles.itemText}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={() => {
            logout();
          }}
        >
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#F5F7FA",
    padding: 20,
  },
  headerContainer: {
    backgroundColor: "#6200EE",
    paddingVertical: 25,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginBottom: 25,
    shadowColor: "#6200EE",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  welcomeText: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 16,
    marginBottom: 4,
  },
  headerText: {
    color: "white",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subHeaderText: {
    color: "rgba(255, 255, 255, 0.85)",
    fontSize: 18,
  },
  sectionContainer: {
    marginTop: 10,
  },
  itemButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 14,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemIcon: {
    fontSize: 24,
    marginRight: 14,
  },
  itemText: {
    color: "white",
    fontSize: 17,
    fontWeight: "600",
  },
  logoutButton: {
    backgroundColor: "#FF3B30",
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 12,
    marginTop: 30,
    alignSelf: "center",
    shadowColor: "#FF3B30",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  logoutButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default Reports;