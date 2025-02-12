import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StyleSheet, View, SafeAreaView } from 'react-native';
import Navbar from './components/Navbar';  
import Home from './components/Home';
import Contribution from './components/Contribution';
import Profile from './components/Profile';
import { AuthProvider } from './Auth/AuthContext';
import Signup from './components/Signup';
import Login from './components/Login';
import EditProfile from './components/EditProfile';
import Support from './components/Support';
import ChatPage from './components/ChatPage'; // Import ChatPage

const Stack = createStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <SafeAreaView style={styles.container}>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Home" component={Home} />
            <Stack.Screen name="Contribution" component={Contribution} />
            <Stack.Screen name="Profile" component={Profile} />
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="Signup" component={Signup} />
            <Stack.Screen name="EditProfile" component={EditProfile} />
            <Stack.Screen name="Support" component={Support} />
            <Stack.Screen name="Chat" component={ChatPage} /> 
          </Stack.Navigator>
        </SafeAreaView>

        {/* Navbar stays at the bottom */}
        <Navbar />
        
        <StatusBar style="auto" />
      </NavigationContainer>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

