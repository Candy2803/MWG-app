import React, { useEffect } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, StatusBar, ScrollView, Alert } from "react-native";
import { useAuth } from "../Auth/AuthContext";
import Icon from "react-native-vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";

const Profile = ({ navigation }) => {
  const { user, logout } = useAuth();

  useEffect(() => {
    if (!user) {
      navigation.replace("Login");
    }
  }, [user, navigation]);

  const handleLogout = () => {
    Alert.alert(
      "Confirm Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Logout", onPress: logout, style: "destructive" }
      ]
    );
  };

  if (!user) return null;

  return (
    <ScrollView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#7F00FF', '#5100AD']} style={styles.header}>
        <View style={styles.profileImageContainer}>
          {user?.profileImage ? (
            <Image source={{ uri: user.profileImage }} style={styles.profileImage} />
          ) : (
            <View style={styles.profileIconContainer}>
              <Icon name="person-circle" size={100} color="#FFF" />
            </View>
          )}
        </View>
      </LinearGradient>
      
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{user?.name || "No Username"}</Text>
        <View style={styles.infoRow}>
          <Icon name="mail-outline" size={18} color="#555" />
          <Text style={styles.infoText}>{user?.email || "No Email"}</Text>
        </View>
        <View style={styles.infoRow}>
          <Icon name="briefcase-outline" size={18} color="#555" />
          <Text style={styles.infoText}>{user?.role || "No Role"}</Text>
        </View>
      </View>
      
      <View style={styles.actionContainer}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate("EditProfile")}
        >
          <Icon name="create-outline" size={22} color="#7F00FF" />
          <Text style={styles.actionButtonText}>Edit Profile</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate("Settings")}
        >
          <Icon name="settings-outline" size={22} color="#7F00FF" />
          <Text style={styles.actionButtonText}>Settings</Text>
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity 
        style={styles.logoutButton} 
        onPress={handleLogout}
        activeOpacity={0.8}
      >
        <Icon name="log-out-outline" size={20} color="#FFF" style={styles.logoutIcon} />
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#f8f8f8" 
  },
  header: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 20,
  },
  profileImageContainer: {
    padding: 5,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 75,
    elevation: 10,
  },
  profileImage: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 4,
    borderColor: "#FFF",
  },
  profileIconContainer: { 
    alignItems: "center", 
    justifyContent: "center", 
  },
  infoContainer: {
    backgroundColor: "#FFF",
    marginTop: -50,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  name: { 
    fontSize: 26, 
    fontWeight: "bold", 
    color: "#333",
    textAlign: "center",
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  infoText: { 
    fontSize: 16, 
    color: "#555", 
    marginLeft: 10,
  },
  actionContainer: {
    backgroundColor: "#FFF",
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 8,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  actionButtonText: { 
    color: "#333", 
    fontSize: 16, 
    marginLeft: 12,
  },
  logoutButton: {
    backgroundColor: "#FF3B30",
    marginHorizontal: 16,
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
  },
  logoutIcon: {
    marginRight: 8
  },
  logoutButtonText: { 
    color: "white", 
    fontSize: 16, 
    fontWeight: "600" 
  },
  versionContainer: {
    alignItems: "center",
    marginTop: 24,
    marginBottom: 30,
  },
  versionText: {
    fontSize: 12,
    color: "#999"
  }
});

export default Profile;