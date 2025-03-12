import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import axios from "axios";

const ManageContributions = () => {
  const [users, setUsers] = useState([]); 
  const [selectedUser, setSelectedUser] = useState(null); 
  const [userContributions, setUserContributions] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [loadingContributions, setLoadingContributions] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setLoading(true);
    axios
      .get(`http://192.168.1.201:5000/api/contributions/users`)
      .then((response) => {
        setUsers(response.data.users);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
        setLoading(false);
      });
  }, []);

  const fetchUserContributions = (userId) => {
    setLoadingContributions(true);
    axios
      .get(`http://192.168.1.201:5000/api/contributions/${userId}/contributions`)
      .then((response) => {
        setUserContributions(response.data.contributions);
        setLoadingContributions(false);
      })
      .catch((error) => {
        console.error("Error fetching contributions:", error);
        setLoadingContributions(false);
      });
  };

  const filteredUsers = users.filter(
    (user) =>
      user.userName.toLowerCase().includes(searchQuery.toLowerCase()) &&
      user.userName.toLowerCase() !== "admin" 
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manage Contributions</Text>

      {!selectedUser && (
        <>
          <TextInput
            style={styles.searchInput}
            placeholder="Search users by name"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

          {loading ? (
            <ActivityIndicator size="large" color="#6200ee" />
          ) : (
            <>
              <Text style={styles.sectionTitle}>
                Users and Total Contributions
              </Text>
              <FlatList
                data={filteredUsers}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.userItem}
                    onPress={() => {
                      setSelectedUser(item); 
                      fetchUserContributions(item._id); 
                    }}
                  >
                    <Text style={styles.userName}>{item.userName}</Text>
                    <Text style={styles.totalContribution}>
                      Total Contributions: KES{" "}
                      {item.totalContributions.toFixed(2)}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </>
          )}
        </>
      )}

      {selectedUser && (
        <View style={styles.userHistorySection}>
          <Text style={styles.userHistoryTitle}>
            {selectedUser.userName}'s Contribution History
          </Text>

          <TouchableOpacity
            style={styles.goBackButton}
            onPress={() => {
              setSelectedUser(null); 
              setUserContributions([]); 
            }}
          >
            <Text style={styles.buttonText}>Go Back</Text>
          </TouchableOpacity>

          {loadingContributions ? (
            <ActivityIndicator size="large" color="#6200ee" />
          ) : userContributions.length > 0 ? (
            <FlatList
              data={userContributions}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <View style={styles.contributionItem}>
                  <Text style={styles.contributionAmount}>
                    Amount: KES {item.amount}
                  </Text>
                  <Text style={styles.contributionDate}>
                    Date: {new Date(item.contributionDate).toLocaleDateString()}
                  </Text>
                  <Text style={styles.paymentMethod}>
                    Method: {item.paymentMethod}
                  </Text>
                </View>
              )}
            />
          ) : (
            <Text style={styles.noContributionsText}>
              No contributions found for {selectedUser.userName}.
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
    color: "#333",
  },
  searchInput: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#6200ee",
  },
  userItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  totalContribution: {
    fontSize: 16,
    color: "#6200ee",
  },
  userHistorySection: {
    marginTop: 30,
  },
  userHistoryTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  contributionItem: {
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contributionAmount: {
    fontSize: 16,
    color: "#6200ee",
  },
  contributionDate: {
    fontSize: 14,
    color: "#888",
  },
  paymentMethod: {
    fontSize: 14,
    color: "#555",
  },
  noContributionsText: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
    marginTop: 10,
  },
  goBackButton: {
    backgroundColor: "#6200ee",
    padding: 10,
    borderRadius: 5,
    alignSelf: "flex-start",
    marginBottom: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
});

export default ManageContributions;
