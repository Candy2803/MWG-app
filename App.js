import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer, useNavigation } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { StyleSheet, SafeAreaView, TouchableOpacity } from "react-native";
import { AuthProvider, useAuth } from "./Auth/AuthContext";
import { ChatProvider } from "./Auth/ChatContext";
import Icon from 'react-native-vector-icons/Ionicons'; 

// Components
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import Contribution from "./components/Contribution";
import Profile from "./components/Profile";
import Signup from "./components/Signup";
import Login from "./components/Login";
import EditProfile from "./components/EditProfile";
import ChatPage from "./components/ChatPage";
import Admin from "./components/Admin";
import ManageUsers from "./components/ManageUsers";
import UserHomeScreen from "./components/UserHomeScreen";
import Settings from "./components/Settings";
import ManageContributions from "./components/ManageContributions";
import Reports from "./components/Reports";
import ForgotPassword from "./components/ForgotPassword";
import MoneyMarketPage from "./components/MoneyMarketPage";
import Events from "./components/Events";
import Meeting from "./components/Meeting";

const Stack = createStackNavigator();

// Create a custom header component that shows a "go back" button on the top right
function CustomHeader({ title, navigation }) {
  return {
    headerTitle: title,
    headerRight: null,
    headerTitleAlign: "center",
  };
}

function AppNavigator() {
  const { user } = useAuth();

  return (
    <Stack.Navigator>
      {user?.role === "admin" ? (
        // Admin Screens
        <>
          <Stack.Screen name="Admin" component={Admin} options={{ headerShown: true, title: "Admin" }} />
          <Stack.Screen
            name="ManageUsers"
            component={ManageUsers}
            options={({ navigation }) => CustomHeader({ title: "Manage Users", navigation })}
          />
          <Stack.Screen
            name="UserHomeScreen"
            component={UserHomeScreen}
            options={({ navigation }) => CustomHeader({ title: "User Home", navigation })}
          />
          <Stack.Screen
            name="Contribution"
            component={Contribution}
            options={({ navigation }) => CustomHeader({ title: "Contribution", navigation })}
          />
          <Stack.Screen
            name="Profile"
            component={Profile}
            options={({ navigation }) => CustomHeader({ title: "Profile", navigation })}
          />
          <Stack.Screen
            name="EditProfile"
            component={EditProfile}
            options={({ navigation }) => CustomHeader({ title: "Edit Profile", navigation })}
          />
          <Stack.Screen
            name="Support"
            component={Support}
            options={({ navigation }) => CustomHeader({ title: "Support", navigation })}
          />
          <Stack.Screen
            name="ChatPage"
            component={ChatPage}
            options={({ navigation }) => CustomHeader({ title: "Chat", navigation })}
          />
          <Stack.Screen
            name="Settings"
            component={Settings}
            options={({ navigation }) => CustomHeader({ title: "Settings", navigation })}
          />
          <Stack.Screen
            name="ManageContributions"
            component={ManageContributions}
            options={({ navigation }) => CustomHeader({ title: "Manage Contributions", navigation })}
          />
          <Stack.Screen
            name="Reports"
            component={Reports}
            options={({ navigation }) => CustomHeader({ title: "Reports", navigation })}
          />
          <Stack.Screen
            name="MoneyMarketPage"
            component={MoneyMarketPage}
            options={({ navigation }) => CustomHeader({ title: "Money Market", navigation })}
          />
          <Stack.Screen
            name="Events"
            component={Events}
            options={({ navigation }) => CustomHeader({ title: "Events", navigation })}
          />
          <Stack.Screen
            name="Meeting"
            component={Meeting}
            options={({ navigation }) => CustomHeader({ title: "Meeting", navigation })}
          />
        </>
      ) : user?.role === "user" ? (
        // User Screens
        <>
          <Stack.Screen name="Home" component={Home} options={{ headerShown: false }} />
          <Stack.Screen
            name="Contribution"
            component={Contribution}
            options={({ navigation }) => CustomHeader({ title: "Contribution", navigation })}
          />
          <Stack.Screen
            name="Profile"
            component={Profile}
            options={({ navigation }) => CustomHeader({ title: "Profile", navigation })}
          />
          <Stack.Screen
            name="EditProfile"
            component={EditProfile}
            options={({ navigation }) => CustomHeader({ title: "Edit Profile", navigation })}
          />
          <Stack.Screen
            name="Chat"
            component={ChatPage}
            options={({ navigation }) => CustomHeader({ title: "Chat", navigation })}
          />
        </>
      ) : (
        // Auth Screens (Login/Signup/ForgotPassword)
        <>
          <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
          <Stack.Screen name="Signup" component={Signup} options={{ headerShown: false }} />
          <Stack.Screen name="ForgotPassword" component={ForgotPassword} options={{ headerShown: false }} />
        </>
      )}
    </Stack.Navigator>
  );
}

function UserNavbar() {
  const { user } = useAuth();
  return user?.role === "user" ? <Navbar /> : null;
}

export default function App() {
  return (
    <AuthProvider>
      <ChatProvider>
        <NavigationContainer>
          <SafeAreaView style={styles.container}>
            <AppNavigator />
          </SafeAreaView>
          <UserNavbar />
          <StatusBar style="auto" />
        </NavigationContainer>
      </ChatProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  headerRightButton: {
    marginRight: 10,
  },
});
