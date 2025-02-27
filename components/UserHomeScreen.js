import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Home from "./Home";  

function UserHomeScreen({ navigation, route }) {
  const { user, impersonating } = route.params;

  return (
    <View style={styles.container}>
      {impersonating && (
        <View style={styles.impersonationBanner}>
          <Text style={styles.impersonationText}>
            You are impersonating: {user.name}
          </Text>
        </View>
      )}

      <Home navigation={navigation} user={user} impersonating={impersonating} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  impersonationBanner: {
    backgroundColor: "#007AFF",
    padding: 10,
    marginBottom: 20,
    borderRadius: 5,
  },
  impersonationText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
  },
});

export default UserHomeScreen;
