import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { useAuth } from "../Auth/AuthContext";
import Icon from "react-native-vector-icons/MaterialIcons";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";

const BASE_URL = "http://192.168.1.201:5000/api";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigation = useNavigation();
  const [impersonatingUser, setImpersonatingUser] = useState(null);
  const { impersonateUser } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/users`);
      setUsers(response.data);
      setError(null);
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("Failed to load users. Pull down to refresh.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (id, index) => {
    const updatedUser = users[index];
    try {
      const response = await axios.put(`${BASE_URL}/users/${id}`, updatedUser);
      setUsers(users.map((user) => (user._id === id ? response.data : user)));
      Alert.alert("Success", `User ${updatedUser.name} updated successfully`);
    } catch (error) {
      console.error("Error updating user:", error);
      Alert.alert("Error", "Failed to update user");
    }
  };

  const handleDelete = (id, name) => {
    Alert.alert(
      "Confirm Delete",
      `Are you sure you want to delete ${name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await axios.delete(`${BASE_URL}/users/${id}`);
              setUsers(users.filter((user) => user._id !== id));
              Alert.alert("Success", "User deleted successfully");
            } catch (error) {
              console.error("Error deleting user:", error);
              Alert.alert("Error", "Failed to delete user");
            }
          },
        },
      ]
    );
  };

  const handleImpersonate = async (user) => {
    if (!user || !user._id) {
      console.error("Invalid user object or missing user ID.");
      return;
    }

    try {
      await axios.get(`${BASE_URL}/users/loginadmin/${user._id}`);
      impersonateUser(user);
      setImpersonatingUser(user);
      navigation.navigate("UserHomeScreen", { user, impersonating: true });
    } catch (error) {
      console.error("Error impersonating user:", error);
      Alert.alert("Error", "Failed to impersonate user. Please try again.");
    }
  };

  const handleChange = (index, key, value) => {
    const updatedUsers = [...users];
    updatedUsers[index][key] = value;
    setUsers(updatedUsers);
  };

  const handleApprove = async (id) => {
    try {
      const response = await axios.put(`${BASE_URL}/users/${id}/approve`);
      setUsers(
        users.map((user) => (user._id === id ? response.data.user : user))
      );
      Alert.alert("Success", "User approval status updated");
    } catch (error) {
      console.error("Error approving user:", error);
      Alert.alert("Error", "Failed to update approval status");
    }
  };

  const renderUserRow = (user, index) => (
    <View
      key={user._id}
      style={[
        styles.row,
        index % 2 === 0 ? styles.evenRow : styles.oddRow,
      ]}
    >
      <TextInput
        style={styles.cell}
        value={user.name}
        onChangeText={(text) => handleChange(index, "name", text)}
      />
      <TextInput
        style={styles.cell}
        value={user.email}
        onChangeText={(text) => handleChange(index, "email", text)}
      />
      <View style={styles.roleContainer}>
        <TextInput
          style={[styles.cell, styles.roleInput]}
          value={user.role}
          onChangeText={(text) => handleChange(index, "role", text)}
        />
        {user.isApproved && (
          <View style={styles.approvedBadge}>
            <Text style={styles.approvedBadgeText}>✓</Text>
          </View>
        )}
      </View>
      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => handleEdit(user._id, index)}
        >
          <Icon name="save" size={22} color="#4CAF50" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => handleDelete(user._id, user.name)}
        >
          <Icon name="delete" size={22} color="#F44336" />
        </TouchableOpacity>

        {user.role !== "admin" ? (
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => handleImpersonate(user)}
          >
            <Icon name="person" size={22} color="#2196F3" />
          </TouchableOpacity>
        ) : (
          <View style={styles.actionButton}>
            <Icon name="person" size={22} color="#9E9E9E" />
          </View>
        )}

        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => handleApprove(user._id)}
        >
          <Icon 
            name={user.isApproved ? "check-circle" : "pending"} 
            size={22} 
            color={user.isApproved ? "#4CAF50" : "#FF9800"} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading && users.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading users...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {impersonatingUser && (
        <View style={styles.impersonationBanner}>
          <Icon name="account-circle" size={20} color="#fff" />
          <Text style={styles.impersonationText}>
            Impersonating: {impersonatingUser.name}
          </Text>
          <TouchableOpacity 
            onPress={() => {
              setImpersonatingUser(null);
              navigation.goBack();
            }}
            style={styles.exitButton}
          >
            <Text style={styles.exitButtonText}>Exit</Text>
          </TouchableOpacity>
        </View>
      )}
      
      <View style={styles.headerContainer}>
        <Text style={styles.message}>Admin Dashboard</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{users.length}</Text>
            <Text style={styles.statLabel}>Total Users</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>
              {users.filter(user => user.isApproved).length}
            </Text>
            <Text style={styles.statLabel}>Approved</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>
              {users.filter(user => !user.isApproved).length}
            </Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
        </View>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchUsers}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.tableContainer}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Name</Text>
          <Text style={styles.headerText}>Email</Text>
          <Text style={styles.headerText}>Role</Text>
          <Text style={styles.headerText}>Actions</Text>
        </View>

        <ScrollView style={styles.scrollView}>
          {users.map(renderUserRow)}
          {users.length === 0 && !loading && (
            <Text style={styles.noDataText}>No users found</Text>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  headerContainer: {
    backgroundColor: "#fff",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    marginBottom: 8,
  },
  message: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 8,
  },
  statBox: {
    backgroundColor: "#f0f8ff",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    width: "30%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2196F3",
  },
  statLabel: {
    fontSize: 12,
    color: "#757575",
    marginTop: 4,
  },
  tableContainer: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 8,
    margin: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    backgroundColor: "#2196F3",
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
  headerText: {
    flex: 1,
    fontWeight: "bold",
    fontSize: 15,
    color: "#fff",
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  row: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderBottomWidth: 1,
    borderBottomColor: "#eeeeee",
  },
  evenRow: {
    backgroundColor: "#ffffff",
  },
  oddRow: {
    backgroundColor: "#f9f9f9",
  },
  cell: {
    flex: 1,
    paddingHorizontal: 3,
    fontSize: 14,
    color: "#333",
  },
  roleContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  roleInput: {
    flex: 0.8,
  },
  approvedBadge: {
    backgroundColor: "#4CAF50",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 5,
  },
  approvedBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    flex: 1,
  },
  actionButton: {
    padding: 8,
  },
  impersonationBanner: {
    backgroundColor: "#2196F3",
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  impersonationText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "500",
    marginLeft: 8,
  },
  exitButton: {
    marginLeft: "auto",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  exitButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#757575",
  },
  errorContainer: {
    backgroundColor: "#FFEBEE",
    margin: 8,
    padding: 12,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  errorText: {
    color: "#D32F2F",
    flex: 1,
  },
  retryButton: {
    backgroundColor: "#D32F2F",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  noDataText: {
    textAlign: "center",
    padding: 20,
    color: "#757575",
    fontStyle: "italic",
  },
});

export default ManageUsers;