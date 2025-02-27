import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

const Support = ({ navigation }) => {
  const [requestDetails, setRequestDetails] = useState('');
  const [status, setStatus] = useState(null);

  const handleRequestSupport = () => {
    if (requestDetails.trim()) {
      setStatus('Your request for family support has been submitted.');
      setRequestDetails('');
    } else {
      setStatus('Please provide some details for your support request.');
    }
  };

  const handleRequestLoan = () => {
    navigation.navigate('LoanRequestForm');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Family Support</Text>
      <Text style={styles.subtitle}>Request support for your family needs</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>How Family Support Works</Text>
        <Text style={styles.text}>1. Fill in the details about the support you need.</Text>
        <Text style={styles.text}>2. Your request will be reviewed by our support team.</Text>
        <Text style={styles.text}>3. You will be contacted for further assistance.</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Request Family Support</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Describe your support needs..." 
          value={requestDetails} 
          onChangeText={setRequestDetails} 
          multiline
        />
        <TouchableOpacity style={styles.button} onPress={handleRequestSupport}>
          <Text style={styles.buttonText}>Submit Support Request</Text>
        </TouchableOpacity>

        {status && <Text style={styles.status}>{status}</Text>}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Request a Loan</Text>
        <TouchableOpacity style={styles.button} onPress={handleRequestLoan}>
          <Text style={styles.buttonText}>Go to Loan Request Form</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>Go Back</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6200ee',
    textAlign: 'center',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    color: '#555',
    marginBottom: 10,
  },
  input: {
    height: 100,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
    color: '#000',
    textAlignVertical: 'top', 
  },
  button: {
    backgroundColor: '#6200ee',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  status: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4caf50',
    textAlign: 'center',
    marginTop: 10,
  },
  backButton: {
    backgroundColor: '#ddd',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  backButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Support;
