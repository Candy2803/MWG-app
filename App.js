import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StyleSheet, View } from 'react-native';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Contribution from './components/Contribution';
import Profile from './components/Profile';
import { AuthProvider } from './Auth/AuthContext';
import Signup from './components/Signup';
import Login from './components/Login';
import EditProfile from './components/EditProfile';

const Stack = createStackNavigator();

export default function App() {
  return (
    <AuthProvider>
    <NavigationContainer>
      <View style={styles.container}>
        <Navbar /> 
        <View style={styles.content}>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Home" component={Home} />
            <Stack.Screen name="Contribution" component={Contribution} />
            <Stack.Screen name="Profile" component={Profile} />
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="Signup" component={Signup} />
            <Stack.Screen name='EditProfile' component={EditProfile} />
          </Stack.Navigator>
        </View>
      </View>
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
  content: {
    flex: 1, 
  },
});
