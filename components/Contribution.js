import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Modal, TextInput, ActivityIndicator } from 'react-native';
import { useAuth } from '../Auth/AuthContext';
import axios from 'axios';

const Contribution = () => {
  const { user, isImpersonating, impersonatedUser } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(false); 
  const [submitting, setSubmitting] = useState(false); 

  const fetchContributions = () => {
    setLoading(true); 
    const userId = isImpersonating ? impersonatedUser?._id : user?._id;
    console.log('Fetching contributions for user ID:', userId);

    if (userId) {
      axios
        .get(`http://172.20.10.4:5000/api/contributions/${userId}/contributions`)
        .then((response) => {
          setContributions(response.data.contributions);
        })
        .catch((error) => {
          console.error('Error fetching contributions:', error.response ? error.response.data : error.message);
          alert('Failed to fetch contributions');
        })
        .finally(() => {
          setLoading(false);  
        });
    }
  };

  useEffect(() => {
    fetchContributions();
  }, [user, impersonatedUser]);

  const calculateTotalContributions = () => {
    return contributions.reduce((total, contribution) => total + (contribution.amount || 0), 0);
  };

  const handleContribution = () => {
    if (amount && paymentMethod) {
      const userId = isImpersonating ? impersonatedUser?._id : user?._id;

      if (!userId) {
        alert('Error: Unable to retrieve user information.');
        return;
      }

      setSubmitting(true); 

      axios
        .post(`http://172.20.10.4:5000/api/contributions/${userId}/contributions`, {
          amount,
          paymentMethod,
        })
        .then((response) => {
          alert(`Contribution of KES ${amount} via ${paymentMethod} submitted!`);
          setModalVisible(false);
          setAmount('');
          setPaymentMethod('');
          fetchContributions();  
        })
        .catch((error) => {
          console.error('Error submitting contribution:', error.response ? error.response.data : error.message);
          alert('Failed to submit contribution. Please try again.');
        })
        .finally(() => {
          setSubmitting(false); 
        });
    } else {
      alert('Please fill all fields.');
    }
  };

  if (!user && !isImpersonating) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>You must be logged in to view this page.</Text>
      </View>
    );
  }

  const displayName = isImpersonating ? impersonatedUser?.name : user?.name;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {isImpersonating
          ? `Welcome, ${displayName} (impersonated)`
          : `Welcome, ${displayName || 'User'}!`}
      </Text>

      <TouchableOpacity style={styles.button} onPress={() => setModalVisible(true)}>
        <Text style={styles.buttonText}>Contribute Now</Text>
      </TouchableOpacity>

      <Text style={styles.totalContributions}>
        Total Contributions: KES {calculateTotalContributions().toFixed(2)}
      </Text>

      <Text style={styles.sectionTitle}>Your Contribution History</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#6200ee" />
      ) : contributions.length > 0 ? (
        <FlatList
          data={contributions}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.contributionItem}>
              <Text style={styles.contributionDate}>
                {item.contributionDate ? new Date(item.contributionDate).toLocaleDateString() : 'Unknown Date'}
              </Text>
              <Text style={styles.contributionAmount}>KES {item.amount}</Text>
              <Text style={styles.paymentMethod}>Method: {item.paymentMethod || 'Unknown'}</Text>
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

            <TouchableOpacity style={styles.submitButton} onPress={handleContribution} disabled={submitting}>
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Submit Payment</Text>
              )}
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
  paymentMethod: {
    fontSize: 14,
    color: '#888',
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
  totalContributions: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    color: '#6200ee',
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
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    padding: 12,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
    color: '#333',
  },
  submitButton: {
    backgroundColor: '#6200ee',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  submitButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: '#ccc',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  cancelButtonText: {
    color: '#333',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default Contribution;
