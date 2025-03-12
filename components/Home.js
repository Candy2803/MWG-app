import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ImageBackground, 
  StyleSheet, 
  SafeAreaView,
  Image,
  Animated,
  Dimensions,
  StatusBar,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { FontAwesome5 } from '@expo/vector-icons';
import { useAuth } from '../Auth/AuthContext';

const { width, height } = Dimensions.get('window');

const Home = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  const handleProfilePress = () => {
    setDropdownVisible(!dropdownVisible);
  };

  const goToProfile = () => {
    setDropdownVisible(false);
    navigation.navigate('Profile');
  };

  const handleLogout = () => {
    setDropdownVisible(false);
    logout();
    navigation.replace('Login');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <ImageBackground
        source={{ uri: 'https://ik.imagekit.io/candyjess/pic.JPG?updatedAt=1739352736306' }}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)', 'rgba(0,0,0,0.85)']}
          style={styles.gradient}
        >
          {/* Header with profile picture */}
          <View style={styles.header}>
            <Text style={styles.welcomeText}>
              {user?.name ? `Hello, ${user.name.split(' ')[0]}` : 'Welcome'}
            </Text>
            <TouchableOpacity 
              style={styles.profileContainer}
              onPress={handleProfilePress}
              activeOpacity={0.8}
            >
              {user?.profileImage ? (
                <Image source={{ uri: user.profileImage }} style={styles.profilePic} />
              ) : (
                <View style={styles.profilePlaceholder}>
                  <Icon name="person" size={22} color="#fff" />
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Dropdown menu */}
          {dropdownVisible && (
            <View style={styles.dropdown}>
              <TouchableOpacity style={styles.dropdownItem} onPress={goToProfile}>
                <Icon name="person-outline" size={20} color="#5e35b1" />
                <Text style={styles.dropdownText}>My Profile</Text>
              </TouchableOpacity>
              <View style={styles.divider} />
              <TouchableOpacity style={styles.dropdownItem} onPress={handleLogout}>
                <Icon name="log-out-outline" size={20} color="#5e35b1" />
                <Text style={styles.dropdownText}>Logout</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Main Content */}
          <Animated.View 
            style={[
              styles.contentContainer,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
            ]}
          >
            <Text style={styles.title}>MWG Welfare</Text>
            <Text style={styles.subtitle}></Text>

            <View style={styles.cardsContainer}>
              <TouchableOpacity 
                style={styles.card}
                onPress={() => navigation.navigate('Contribution')}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={['#7c4dff', '#5e35b1']}
                  style={styles.cardGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.cardIconContainer}>
                    <FontAwesome5 name="hand-holding-heart" size={28} color="#fff" />
                  </View>
                  <Text style={styles.cardTitle}>Make a Contribution</Text>
                  <Text style={styles.cardSubtitle}>To community welfare</Text>
                  <View style={styles.cardArrow}>
                    <Icon name="arrow-forward" size={18} color="#fff" />
                  </View>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.card}
                onPress={() => navigation.navigate('Chat')}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={['#00b0ff', '#0091ea']}
                  style={styles.cardGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.cardIconContainer}>
                    <FontAwesome5 name="users" size={24} color="#fff" />
                  </View>
                  <Text style={styles.cardTitle}>Community</Text>
                  <Text style={styles.cardSubtitle}>Connect with members</Text>
                  <View style={styles.cardArrow}>
                    <Icon name="arrow-forward" size={18} color="#fff" />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}></Text>
                <Text style={styles.statLabel}>Members</Text>
              </View>
              <View style={[styles.statCard, styles.middleStatCard]}>
                <Text style={styles.statNumber}></Text>
                <Text style={styles.statLabel}>Total Contributions</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}></Text>
                <Text style={styles.statLabel}>Active Events</Text>
              </View>
            </View>

            

          </Animated.View>
        </LinearGradient>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  gradient: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 15,
  },
  welcomeText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '500',
  },
  profileContainer: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    overflow: 'hidden',
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  profilePlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdown: {
    position: 'absolute',
    top: Platform.OS === 'android' ? StatusBar.currentHeight + 65 : 65,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    zIndex: 100,
    width: 150,
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
  dropdownText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 40,
    textAlign: 'center',
  },
  cardsContainer: {
    width: '100%',
    flexDirection: 'column',
    marginBottom: 24,
  },
  card: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  cardGradient: {
    padding: 20,
    height: 120,
    justifyContent: 'center',
  },
  cardIconContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 30,
  },
  cardSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginTop: 5,
  },
  cardArrow: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    width: '30%',
  },
  middleStatCard: {
    backgroundColor: 'rgba(94, 53, 177, 0.3)',
  },
  statNumber: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    textAlign: 'center',
  },
  
});

export default Home;