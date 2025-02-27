import React from 'react';
import { View, Text, TouchableOpacity, ImageBackground, StyleSheet, SafeAreaView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const Home = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground
        source={{ uri: 'https://ik.imagekit.io/candyjess/pic.JPG?updatedAt=1739352736306' }}
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
            <Icon name="heart" size={40} color="#f50057" style={styles.icon} />
            <Icon name="people" size={40} color="#00b0ff" style={styles.icon} />
          </View>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 20,
    borderRadius: 12,
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
    backgroundColor: '#1e88e5',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginBottom: 10,
    width: 260,
    alignItems: 'center',
    elevation: 2, // For subtle shadow effect on buttons
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  iconContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '60%',
  },
  icon: {
    paddingHorizontal: 10,
  },
});

export default Home;
