import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ImageBackground, 
  StyleSheet, 
  SafeAreaView,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../Auth/AuthContext';

const Home = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const handleProfilePress = () => {
    setDropdownVisible(!dropdownVisible);
  };

  const goToProfile = () => {
    setDropdownVisible(false);
    navigation.navigate('Profile');
  };

  // const handleLogout = () => {
  //   setDropdownVisible(false);
  //   logout();
  //   navigation.replace('Login');
  // };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground
        source={{ uri: 'https://ik.imagekit.io/candyjess/pic.JPG?updatedAt=1739352736306' }}
        style={styles.container}
      >
        {/* Top right profile picture with dropdown */}
        <View style={styles.topRightContainer}>
          <TouchableOpacity onPress={handleProfilePress}>
            {user?.profileImage ? (
              <Image source={{ uri: user.profileImage }} style={styles.profilePic} />
            ) : (
              <Icon name="person-circle" size={40} color="#fff" />
            )}
          </TouchableOpacity>
          {dropdownVisible && (
            <View style={styles.dropdown}>
              <TouchableOpacity style={styles.dropdownItem} onPress={goToProfile}>
                <Text style={styles.dropdownText}>Go to Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.dropdownItem} onPress={logout}>
                <Text style={styles.dropdownText}>Logout</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

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
  topRightContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 10,
    alignItems: 'flex-end',
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#fff',
  },
  dropdown: {
    position: 'absolute',
    top: 45,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    paddingVertical: 5,
    width: 150,
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  dropdownText: {
    fontSize: 16,
    color: '#333',
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
    elevation: 2,
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
