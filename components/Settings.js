import React, { useState } from "react";
import { View, Text, StyleSheet, Switch, TouchableOpacity } from "react-native";

const Settings = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Toggle function for Dark Mode
  const toggleDarkMode = () => {
    setIsDarkMode((previousState) => !previousState);
  };

  // Dynamic styles based on the theme
  const themeStyles = isDarkMode ? darkThemeStyles : lightThemeStyles;

  return (
    <View style={[styles.container, themeStyles.container]}>
      <Text style={[styles.header, themeStyles.text]}>Settings</Text>

      {/* Toggle for Dark/Light Mode */}
      <View style={styles.sectionContainer}>
        <Text style={[styles.sectionTitle, themeStyles.text]}>
          Dark Mode
        </Text>
        <Switch
          value={isDarkMode}
          onValueChange={toggleDarkMode}
          thumbColor={isDarkMode ? "#f4f3f4" : "#fff"}
          trackColor={{ false: "#767577", true: "#6200ee" }}
        />
      </View>

      {/* Additional Settings Options */}
      <TouchableOpacity style={[styles.settingsOption, themeStyles.option]}>
        <Text style={[styles.optionText, themeStyles.text]}>Account Settings</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.settingsOption, themeStyles.option]}>
        <Text style={[styles.optionText, themeStyles.text]}>Notification Settings</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.settingsOption, themeStyles.option]}>
        <Text style={[styles.optionText, themeStyles.text]}>Privacy Settings</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 40,
    textAlign: "center",
  },
  sectionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "500",
  },
  settingsOption: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  optionText: {
    fontSize: 18,
  },
});

// Light Theme Styles
const lightThemeStyles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
  },
  text: {
    color: "#000",
  },
  option: {
    backgroundColor: "#f9f9f9",
  },
});

// Dark Theme Styles
const darkThemeStyles = StyleSheet.create({
  container: {
    backgroundColor: "#121212",
  },
  text: {
    color: "#f1f1f1",
  },
  option: {
    backgroundColor: "#333",
  },
});

export default Settings;
