import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, FlatList, Modal, TextInput 
} from 'react-native';
import { useAuth } from '../Auth/AuthContext';

const Contribution = () => {
  const { user } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');

  const contributions = [
    { id: '1', date: 'Feb 5, 2025', amount: 'KES 1,500' },
    { id: '2', date: 'Jan 20, 2025', amount: 'KES 2,000' },
    { id: '3', date: 'Dec 15, 2024', amount: 'KES 1,000' },
  ];

  const handleContribution = () => {
    if (amount && paymentMethod) {
      alert(`Contribution of ${amount} via ${paymentMethod} submitted!`);
      setModalVisible(false);
      setAmount('');
      setPaymentMethod('');
    } else {
      alert('Please fill all fields.');
    }
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>You must be logged in to view this page.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome, {user?.username || 'User'}!</Text>

      <TouchableOpacity style={styles.button} onPress={() => setModalVisible(true)}>
        <Text style={styles.buttonText}>Contribute Now</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Your Contribution History</Text>
      {contributions.length > 0 ? (
        <FlatList
          data={contributions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.contributionItem}>
              <Text style={styles.contributionDate}>{item.date}</Text>
              <Text style={styles.contributionAmount}>{item.amount}</Text>
            </View>
          )}
        />
      ) : (
        <Text style={styles.noHistory}>No contributions yet.</Text>
      )}

      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter Payment Details</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Enter Amount (KES)"
              placeholderTextColor="#ccc"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />

            <TextInput
              style={styles.input}
              placeholder="Payment Method (e.g., M-Pesa)"
              placeholderTextColor="#ccc"
              value={paymentMethod}
              onChangeText={setPaymentMethod}
            />

            <TouchableOpacity style={styles.submitButton} onPress={handleContribution}>
              <Text style={styles.submitButtonText}>Submit Payment</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  contributionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 8,
    marginVertical: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginLeft: 15
  },
  contributionDate: {
    fontSize: 16,
    color: '#555',
  },
  contributionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6200ee',
  },
  noHistory: {
    fontSize: 16,
    color: '#888',
    marginTop: 10,
  },
  button: {
    backgroundColor: '#6200ee',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    color: '#000',
  },
  submitButton: {
    backgroundColor: '#6200ee',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    marginTop: 10,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#6200ee',
  },
});

export default Contribution;
