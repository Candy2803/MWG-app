import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const Navbar = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.navbar}>
      <Text style={styles.logo}>MWG</Text>

      <View style={styles.linksContainer}>
        <TouchableOpacity style={styles.link} onPress={() => navigation.navigate('Home')}>
          <Text style={styles.linkText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.link} onPress={() => navigation.navigate('Contribution')}>
          <Text style={styles.linkText}>Payment</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.link} onPress={() => navigation.navigate('Profile')}>
          <Text style={styles.linkText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  navbar: {
    width: '100%',
    height: 100,
    backgroundColor: '#6200ee',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  logo: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 24,
  },
  linksContainer: {
    flexDirection: 'row',
    gap: 20,
  },
  link: {
    paddingVertical: 5,
  },
  linkText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginTop: 24,
  },
});

export default Navbar;
