import React from 'react';
import { View, Text, TouchableOpacity, ImageBackground, StyleSheet, SafeAreaView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'; // Add icons for visual appeal

const Home = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground 
        source={{uri: 'https://ik.imagekit.io/candyjess/pic.JPG?updatedAt=1739352736306'}} 
        style={styles.container}
      >
        <View style={styles.overlay}>
          <Text style={styles.title}>Welcome to MWG Welfare App! 🎉</Text>
          <Text style={styles.subtitle}>A platform for family support and contributions.</Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.button} 
              onPress={() => navigation.navigate('Contribution')}
            >
              <Text style={styles.buttonText}>Make a Contribution</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.button} 
              onPress={() => navigation.navigate('Support')}
            >
              <Text style={styles.buttonText}>Get Family Support</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.iconContainer}>
            {/* Add some fun icons to make it feel more interactive */}
            <Icon name="heart" size={40} color="#f50057" />
            <Icon name="people" size={40} color="#00b0ff" />
          </View>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1, // Make sure the SafeAreaView takes full height of the screen.
  },
  container: {
    flex: 1, // Ensures the ImageBackground fills the entire available space
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Darken background for better text visibility
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 30,
    textAlign: 'center',
  },
  buttonContainer: {
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#6200ee',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginBottom: 10,
    width: 250,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  iconContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '100%',
  },
});

export default Home;
