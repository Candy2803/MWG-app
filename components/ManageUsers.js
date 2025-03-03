import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  Alert,
  TouchableOpacity,
} from "react-native";
import { useAuth } from "../Auth/AuthContext";
import Icon from "react-native-vector-icons/MaterialIcons";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";

function ManageUsers() {
  const [users, setUsers] = useState([]);
  const navigation = useNavigation(); // For navigation
  const [impersonatingUser, setImpersonatingUser] = useState(null);

  useEffect(() => {
    axios
      .get("http://192.168.0.112:5000/api/users")
      .then((response) => {
        setUsers(response.data);
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
      });
  }, []);

  const handleEdit = (id, index) => {
    const updatedUser = users[index];

    axios
      .put(`http://192.168.0.112:5000/api/users/${id}`, updatedUser)
      .then((response) => {
        setUsers(users.map((user) => (user._id === id ? response.data : user)));
        Alert.alert(
          "Success",
          `User ${updatedUser.name} has been updated successfully`
        );
      })
      .catch((error) => {
        console.error("Error updating user:", error);
        Alert.alert("Error", "Failed to update user");
      });
  };

  const handleDelete = (id) => {
    Alert.alert(
      "Confirm Delete",
      `Are you sure you want to delete this user?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress: () => {
            axios
              .delete(`http://192.168.0.112:5000/api/users/${id}`)
              .then(() => {
                setUsers(users.filter((user) => user._id !== id));
              })
              .catch((error) => {
                console.error("Error deleting user:", error);
              });
          },
        },
      ]
    );
  };

  const { impersonateUser } = useAuth();

  const handleImpersonate = (user) => {
    if (!user || !user._id) {
      console.error("Invalid user object or missing user ID.");
      return;
    }

    axios
      .get(`http://192.168.0.112:5000/api/users/loginadmin/${user._id}`)
      .then(() => {
        impersonateUser(user);

        navigation.navigate("UserHomeScreen", { user, impersonating: true });
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
        Alert.alert("Error", "Failed to impersonate user. Please try again.");
      });
  };

  const handleChange = (index, key, value) => {
    const updatedUsers = [...users];
    updatedUsers[index][key] = value;
    setUsers(updatedUsers);
  };

  const handleApprove = (id) => {
    axios
      .put(`http://192.168.0.112:5000/api/users/${id}/approve`)
      .then((response) => {
        setUsers(
          users.map((user) => (user._id === id ? response.data.user : user))
        );
        Alert.alert("Success", "User has been approved successfully");
      })
      .catch((error) => {
        console.error("Error approving user:", error);
        Alert.alert("Error", "Failed to approve user");
      });
  };

  return (
    <View style={styles.container}>
      {impersonatingUser && (
        <View style={styles.impersonationBanner}>
          <Text style={styles.impersonationText}>
            Impersonating: {impersonatingUser.name}
          </Text>
        </View>
      )}
      <View style={styles.totalNumber}>
        <Text style={styles.message}>WELCOME ADMIN!</Text>
        <Text style={styles.totalNumberText}>Total Users: {users.length}</Text>
      </View>
      <View style={styles.header}>
        <Text style={styles.headerText}>Name</Text>
        <Text style={styles.headerText}>Email</Text>
        <Text style={styles.headerText}>Role</Text>
        <Text style={styles.headerText}>Actions</Text>
      </View>

      <ScrollView>
        {users.map((user, index) => (
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
            <TextInput
              style={styles.cell}
              value={user.role}
              onChangeText={(text) => handleChange(index, "role", text)}
            />
            <View style={styles.actions}>
              <TouchableOpacity onPress={() => handleEdit(user._id, index)}>
                <Icon name="save" size={24} color="#000" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(user._id)}>
                <Icon name="delete" size={24} color="red" />
              </TouchableOpacity>

              {user.role !== "admin" ? (
                <TouchableOpacity onPress={() => handleImpersonate(user)}>
                  <Icon name="person" size={24} color="#007AFF" />
                </TouchableOpacity>
              ) : (
                <Icon name="person" size={24} color="gray" />
              )}

              {user.role !== "admin" && !user.isApproved ? (
                <TouchableOpacity onPress={() => handleApprove(user._id)}>
                  <Icon name="close" size={24} color="#FF0000" />
                </TouchableOpacity>
              ) : (
                user.isApproved && (
                  <TouchableOpacity onPress={() => handleApprove(user._id)}>
                    <Icon name="check" size={24} color="#00A000" />
                  </TouchableOpacity>
                )
              )}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    backgroundColor: "#f2f2f2",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerText: {
    flex: 1,
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  evenRow: {
    backgroundColor: "#f9f9f9",
  },
  oddRow: {
    backgroundColor: "#fff",
  },
  cell: {
    flex: 1,
    textAlign: "center",
    paddingHorizontal: 5,
    fontSize: 14,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: 120,
  },
  totalNumber: {
    alignItems: "center",
    marginBottom: 10,
  },
  totalNumberText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  message: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  impersonationBanner: {
    backgroundColor: "#007AFF",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  impersonationText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
  },
  approvedText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#00A000",
  },
});

export default ManageUsers;
