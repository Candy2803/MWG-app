import React, { useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from '../Auth/AuthContext';
import Icon from 'react-native-vector-icons/Ionicons';

const Profile = ({ navigation }) => {
  const { user, logout } = useAuth();

  useEffect(() => {
    if (!user) {
      navigation.replace('Login'); 
    }
  }, [user, navigation]);

  if (!user) return null;

  return (
    <View style={styles.container}>
      <View style={styles.profileContainer}>
        {/* Profile Image or Icon */}
        {user?.profileImage ? (
          <Image source={{ uri: user.profileImage }} style={styles.profileImage} />
        ) : (
          <View style={styles.profileIconContainer}>
            <Icon name="person-circle" size={120} color="#6200ee" />
          </View>
        )}

        {/* User Information */}
        <Text style={styles.name}>{user?.username || 'No Username'}</Text>
        <Text style={styles.email}>{user?.email || 'No Email'}</Text>

        {/* Edit Profile Button */}
        <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate('EditProfile')}>
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  profileContainer: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: 20, 
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#6200ee',
    marginBottom: 15,
  },
  profileIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  name: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  email: { fontSize: 16, color: '#666', marginBottom: 20 },
  editButton: {
    backgroundColor: '#6200ee',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: '80%',
    alignItems: 'center',
    marginBottom: 10,
  },
  editButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  logoutButton: {
    backgroundColor: '#d9534f',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: '80%',
    alignItems: 'center',
  },
  logoutButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});

export default Profile;
