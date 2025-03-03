import React from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { StyleSheet, SafeAreaView } from "react-native";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import Contribution from "./components/Contribution";
import Profile from "./components/Profile";
import { AuthProvider, useAuth } from "./Auth/AuthContext"; // Import useAuth
import Signup from "./components/Signup";
import Login from "./components/Login";
import EditProfile from "./components/EditProfile";
import Support from "./components/Support";
import ChatPage from "./components/ChatPage";
import Admin from "./components/Admin";
import ManageUsers from "./components/ManageUsers";
import UserHomeScreen from "./components/UserHomeScreen";
import Settings from "./components/Settings";
import ManageContributions from "./components/ManageContributions";
import Reports from "./components/Reports";
import ForgotPassword from "./components/ForgotPassword";

const Stack = createStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <SafeAreaView style={styles.container}>
          <AppNavigator />
        </SafeAreaView>
        <UserNavbar />
        <StatusBar style="auto" />
      </NavigationContainer>
    </AuthProvider>
  );
}

function AppNavigator() {
  const { user } = useAuth(); 

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user?.role === "admin" ? (
        <>
          <Stack.Screen name="Admin" component={Admin} />
          <Stack.Screen name="ManageUsers" component={ManageUsers} />
          <Stack.Screen name="UserHomeScreen" component={UserHomeScreen} />
          <Stack.Screen name="Contribution" component={Contribution} />
          <Stack.Screen name="Profile" component={Profile} />
          <Stack.Screen name="EditProfile" component={EditProfile} />
          <Stack.Screen name="Support" component={Support} />
          <Stack.Screen name="Chat" component={ChatPage} />
          <Stack.Screen name="Settings" component={Settings} />
          <Stack.Screen name="ManageContributions" component={ManageContributions} />
          <Stack.Screen name="Reports" component={Reports} />
        </>
      ) : user?.role === "user" ? (
        <>
          <Stack.Screen name="Home" component={Home} />
          <Stack.Screen name="Contribution" component={Contribution} />
          <Stack.Screen name="Profile" component={Profile} />
          <Stack.Screen name="EditProfile" component={EditProfile} />
          <Stack.Screen name="Support" component={Support} />
          <Stack.Screen name="Chat" component={ChatPage} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Signup" component={Signup} />
          <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
        </>
      )}
    </Stack.Navigator>
  );
}

function UserNavbar() {
  const { user } = useAuth(); // Access user from AuthContext

  // Conditionally render Navbar for user role only
  return user?.role === "user" ? <Navbar /> : null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
