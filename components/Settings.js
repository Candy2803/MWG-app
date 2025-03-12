import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert,
  StatusBar
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useAuth } from "../Auth/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Settings = ({ navigation }) => {
  const { user } = useAuth();
  
  // Settings state
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [biometricLogin, setBiometricLogin] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [dataUsage, setDataUsage] = useState(false);
  
  // Save settings to storage when they change
  const saveSettings = async (key, value) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.log("Error saving settings", error);
    }
  };

  // Toggle handlers
  const togglePushNotifications = (value) => {
    setPushNotifications(value);
    saveSettings("pushNotifications", value);
  };

  const toggleEmailNotifications = (value) => {
    setEmailNotifications(value);
    saveSettings("emailNotifications", value);
  };

  const toggleDarkMode = (value) => {
    setDarkMode(value);
    saveSettings("darkMode", value);
    // Here you would apply the dark mode theme to your app
  };

  const toggleBiometricLogin = (value) => {
    setBiometricLogin(value);
    saveSettings("biometricLogin", value);
  };

  const toggleAutoSave = (value) => {
    setAutoSave(value);
    saveSettings("autoSave", value);
  };

  const toggleDataUsage = (value) => {
    setDataUsage(value);
    saveSettings("dataUsage", value);
  };

  const clearCache = () => {
    Alert.alert(
      "Clear Cache",
      "Are you sure you want to clear the app cache? This might sign you out.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          onPress: async () => {
            try {
              // Preserve login info but clear other data
              const authData = await AsyncStorage.getItem("authData");
              await AsyncStorage.clear();
              if (authData) await AsyncStorage.setItem("authData", authData);
              Alert.alert("Success", "Cache cleared successfully");
            } catch (error) {
              Alert.alert("Error", "Failed to clear cache");
            }
          },
          style: "destructive"
        }
      ]
    );
  };

  const resetSettings = () => {
    Alert.alert(
      "Reset Settings",
      "Are you sure you want to reset all settings to default?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          onPress: () => {
            setPushNotifications(true);
            setEmailNotifications(true);
            setDarkMode(false);
            setBiometricLogin(false);
            setAutoSave(true);
            setDataUsage(false);
            
            // Reset all settings in storage
            saveSettings("pushNotifications", true);
            saveSettings("emailNotifications", true);
            saveSettings("darkMode", false);
            saveSettings("biometricLogin", false);
            saveSettings("autoSave", true);
            saveSettings("dataUsage", false);
            
            Alert.alert("Success", "Settings reset to default");
          },
          style: "destructive"
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Account Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        
        <TouchableOpacity style={styles.option} onPress={() => navigation.navigate("EditProfile")}>
          <View style={styles.optionLeft}>
            <Icon name="person-outline" size={22} color="#7F00FF" style={styles.optionIcon} />
            <Text style={styles.optionText}>Edit Profile</Text>
          </View>
          <Icon name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.option} onPress={() => navigation.navigate("ChangePassword")}>
          <View style={styles.optionLeft}>
            <Icon name="lock-closed-outline" size={22} color="#7F00FF" style={styles.optionIcon} />
            <Text style={styles.optionText}>Change Password</Text>
          </View>
          <Icon name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.option} onPress={() => navigation.navigate("Privacy")}>
          <View style={styles.optionLeft}>
            <Icon name="shield-checkmark-outline" size={22} color="#7F00FF" style={styles.optionIcon} />
            <Text style={styles.optionText}>Privacy Settings</Text>
          </View>
          <Icon name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
      </View>

      {/* Notifications Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        
        <View style={styles.option}>
          <View style={styles.optionLeft}>
            <Icon name="notifications-outline" size={22} color="#7F00FF" style={styles.optionIcon} />
            <Text style={styles.optionText}>Push Notifications</Text>
          </View>
          <Switch
            value={pushNotifications}
            onValueChange={togglePushNotifications}
            trackColor={{ false: "#e0e0e0", true: "#b980ff" }}
            thumbColor={pushNotifications ? "#7F00FF" : "#f4f3f4"}
          />
        </View>
        
        <View style={styles.option}>
          <View style={styles.optionLeft}>
            <Icon name="mail-outline" size={22} color="#7F00FF" style={styles.optionIcon} />
            <Text style={styles.optionText}>Email Notifications</Text>
          </View>
          <Switch
            value={emailNotifications}
            onValueChange={toggleEmailNotifications}
            trackColor={{ false: "#e0e0e0", true: "#b980ff" }}
            thumbColor={emailNotifications ? "#7F00FF" : "#f4f3f4"}
          />
        </View>
      </View>

      {/* Appearance & Behavior */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Appearance & Behavior</Text>
        
        <View style={styles.option}>
          <View style={styles.optionLeft}>
            <Icon name="moon-outline" size={22} color="#7F00FF" style={styles.optionIcon} />
            <Text style={styles.optionText}>Dark Mode</Text>
          </View>
          <Switch
            value={darkMode}
            onValueChange={toggleDarkMode}
            trackColor={{ false: "#e0e0e0", true: "#b980ff" }}
            thumbColor={darkMode ? "#7F00FF" : "#f4f3f4"}
          />
        </View>
        
        <View style={styles.option}>
          <View style={styles.optionLeft}>
            <Icon name="finger-print-outline" size={22} color="#7F00FF" style={styles.optionIcon} />
            <Text style={styles.optionText}>Biometric Login</Text>
          </View>
          <Switch
            value={biometricLogin}
            onValueChange={toggleBiometricLogin}
            trackColor={{ false: "#e0e0e0", true: "#b980ff" }}
            thumbColor={biometricLogin ? "#7F00FF" : "#f4f3f4"}
          />
        </View>
        
        <View style={styles.option}>
          <View style={styles.optionLeft}>
            <Icon name="save-outline" size={22} color="#7F00FF" style={styles.optionIcon} />
            <Text style={styles.optionText}>Auto-Save Changes</Text>
          </View>
          <Switch
            value={autoSave}
            onValueChange={toggleAutoSave}
            trackColor={{ false: "#e0e0e0", true: "#b980ff" }}
            thumbColor={autoSave ? "#7F00FF" : "#f4f3f4"}
          />
        </View>
        
        <View style={styles.option}>
          <View style={styles.optionLeft}>
            <Icon name="cellular-outline" size={22} color="#7F00FF" style={styles.optionIcon} />
            <Text style={styles.optionText}>Reduce Data Usage</Text>
          </View>
          <Switch
            value={dataUsage}
            onValueChange={toggleDataUsage}
            trackColor={{ false: "#e0e0e0", true: "#b980ff" }}
            thumbColor={dataUsage ? "#7F00FF" : "#f4f3f4"}
          />
        </View>
      </View>

      {/* Support & About */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support & About</Text>
        
        <TouchableOpacity style={styles.option} onPress={() => navigation.navigate("Help")}>
          <View style={styles.optionLeft}>
            <Icon name="help-circle-outline" size={22} color="#7F00FF" style={styles.optionIcon} />
            <Text style={styles.optionText}>Help & Support</Text>
          </View>
          <Icon name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.option} onPress={() => navigation.navigate("About")}>
          <View style={styles.optionLeft}>
            <Icon name="information-circle-outline" size={22} color="#7F00FF" style={styles.optionIcon} />
            <Text style={styles.optionText}>About</Text>
          </View>
          <Icon name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.option} onPress={() => navigation.navigate("TermsAndPrivacy")}>
          <View style={styles.optionLeft}>
            <Icon name="document-text-outline" size={22} color="#7F00FF" style={styles.optionIcon} />
            <Text style={styles.optionText}>Terms & Privacy Policy</Text>
          </View>
          <Icon name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
      </View>

      {/* Data Management */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Management</Text>
        
        <TouchableOpacity style={styles.option} onPress={clearCache}>
          <View style={styles.optionLeft}>
            <Icon name="trash-outline" size={22} color="#FF3B30" style={styles.optionIcon} />
            <Text style={styles.optionText}>Clear Cache</Text>
          </View>
          <Icon name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.option} onPress={resetSettings}>
          <View style={styles.optionLeft}>
            <Icon name="refresh-outline" size={22} color="#FF3B30" style={styles.optionIcon} />
            <Text style={styles.optionText}>Reset Settings</Text>
          </View>
          <Icon name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Version 1.0.0</Text>
        <Text style={styles.footerText}>{user?.email}</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  placeholder: {
    width: 40,
  },
  section: {
    backgroundColor: "#FFF",
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  optionIcon: {
    marginRight: 12,
  },
  optionText: {
    fontSize: 16,
    color: "#333",
  },
  footer: {
    marginTop: 24,
    marginBottom: 40,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  footerText: {
    fontSize: 13,
    color: "#999",
    marginBottom: 4,
  },
});

export default Settings;