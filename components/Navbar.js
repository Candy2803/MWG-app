import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'; 
import { useNavigation } from '@react-navigation/native';

const Navbar = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.navbar}>
      <TouchableOpacity style={styles.icon} onPress={() => navigation.navigate('Home')}>
        <Icon name="home" size={30} color="white" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.icon} onPress={() => navigation.navigate('Contribution')}>
        <Icon name="cash" size={30} color="white" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.icon} onPress={() => navigation.navigate('Chat')}>
        <Icon name="chatbubbles" size={30} color="white" /> 
      </TouchableOpacity>
      <TouchableOpacity style={styles.icon} onPress={() => navigation.navigate('Profile')}>
        <Icon name="person" size={30} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  navbar: {
    width: '100%',
    height: 90,
    backgroundColor: '#6200ee',
    position: 'absolute',
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  icon: {
    padding: 10,
  },
});

export default Navbar;
