import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Image,
} from "react-native";
import axios from "axios";
import Icon from "react-native-vector-icons/MaterialIcons";

const BASE_URL = "http://192.168.1.201:5000/api";

const ManageContributions = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userContributions, setUserContributions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingContributions, setLoadingContributions] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalAmount, setTotalAmount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (users.length > 0) {
      const total = users.reduce((sum, user) => sum + user.totalContributions, 0);
      setTotalAmount(total);
    }
  }, [users]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/contributions/users`);
      setUsers(response.data.users.filter(user => 
        user.userName.toLowerCase() !== "admin"));
      setLoading(false);
    } catch (error) {
      console.error("Error fetching users:", error);
      setLoading(false);
    }
  };

  const fetchUserContributions = async (userId) => {
    setLoadingContributions(true);
    try {
      const response = await axios.get(`${BASE_URL}/contributions/${userId}/contributions`);
      setUserContributions(response.data.contributions);
      setLoadingContributions(false);
    } catch (error) {
      console.error("Error fetching contributions:", error);
      setLoadingContributions(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUsers();
    if (selectedUser) {
      await fetchUserContributions(selectedUser._id);
    }
    setRefreshing(false);
  };

  const filteredUsers = users.filter(
    (user) => user.userName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatCurrency = (amount) => {
    return `KES ${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getPaymentMethodIcon = (method) => {
    switch (method.toLowerCase()) {
      case 'mpesa':
        return 'phone-android';
      case 'cash':
        return 'attach-money';
      case 'bank':
        return 'account-balance';
      default:
        return 'payment';
    }
  };

  const renderUserItem = ({ item }) => (
    <TouchableOpacity
      style={styles.userCard}
      onPress={() => {
        setSelectedUser(item);
        fetchUserContributions(item._id);
      }}
    >
      <View style={styles.userCardContent}>
        <View style={styles.userAvatar}>
          <Text style={styles.userInitial}>{item.userName.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.userName}</Text>
          <Text style={styles.totalContribution}>
            {formatCurrency(item.totalContributions)}
          </Text>
        </View>
        <Icon name="chevron-right" size={24} color="#6200ee" />
      </View>
    </TouchableOpacity>
  );

  const renderContributionItem = ({ item }) => (
    <View style={styles.contributionCard}>
      <View style={styles.contributionHeader}>
        <View style={styles.methodIconContainer}>
          <Icon name={getPaymentMethodIcon(item.paymentMethod)} size={24} color="#fff" />
        </View>
        <View style={styles.contributionInfo}>
          <Text style={styles.contributionAmount}>{formatCurrency(item.amount)}</Text>
          <Text style={styles.contributionDate}>{formatDate(item.contributionDate)}</Text>
        </View>
      </View>
      <View style={styles.contributionDetails}>
        <View style={styles.detailItem}>
          <Icon name="access-time" size={16} color="#888" />
          <Text style={styles.detailText}>
            {new Date(item.contributionDate).toLocaleTimeString()}
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Icon name="payment" size={16} color="#888" />
          <Text style={styles.detailText}>{item.paymentMethod}</Text>
        </View>
        {item.transactionId && (
          <View style={styles.detailItem}>
            <Icon name="confirmation-number" size={16} color="#888" />
            <Text style={styles.detailText}>ID: {item.transactionId}</Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#6200ee" />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Contributions Manager</Text>
          {!selectedUser && (
            <View style={styles.statsCard}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{users.length}</Text>
                <Text style={styles.statLabel}>Contributors</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{formatCurrency(totalAmount)}</Text>
                <Text style={styles.statLabel}>Total Funds</Text>
              </View>
            </View>
          )}
        </View>

        {!selectedUser ? (
          <View style={styles.mainContent}>
            <View style={styles.searchContainer}>
              <Icon name="search" size={20} color="#888" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search contributors by name"
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#888"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery("")}>
                  <Icon name="cancel" size={20} color="#888" />
                </TouchableOpacity>
              )}
            </View>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6200ee" />
                <Text style={styles.loadingText}>Loading contributors...</Text>
              </View>
            ) : filteredUsers.length > 0 ? (
              <FlatList
                data={filteredUsers}
                keyExtractor={(item) => item._id}
                renderItem={renderUserItem}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.usersList}
                refreshing={refreshing}
                onRefresh={onRefresh}
                ListHeaderComponent={
                  <Text style={styles.sectionTitle}>
                    Contributors ({filteredUsers.length})
                  </Text>
                }
              />
            ) : (
              <View style={styles.emptyStateContainer}>
                <Icon name="person-search" size={64} color="#d0d0d0" />
                <Text style={styles.emptyStateText}>
                  No contributors found matching "{searchQuery}"
                </Text>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.userHistorySection}>
            <View style={styles.userHistoryHeader}>
              <TouchableOpacity
                style={styles.goBackButton}
                onPress={() => {
                  setSelectedUser(null);
                  setUserContributions([]);
                }}
              >
                <Icon name="arrow-back" size={24} color="#fff" />
              </TouchableOpacity>
              <View style={styles.userHistoryTitleContainer}>
                <Text style={styles.userHistoryTitle}>{selectedUser.userName}</Text>
                <Text style={styles.userHistorySubtitle}>
                  Total: {formatCurrency(selectedUser.totalContributions)}
                </Text>
              </View>
            </View>

            {loadingContributions ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6200ee" />
                <Text style={styles.loadingText}>Loading contributions...</Text>
              </View>
            ) : userContributions.length > 0 ? (
              <FlatList
                data={userContributions}
                keyExtractor={(item) => item._id}
                renderItem={renderContributionItem}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.contributionsList}
                refreshing={refreshing}
                onRefresh={onRefresh}
                ListHeaderComponent={
                  <Text style={styles.sectionTitle}>
                    Contribution History ({userContributions.length})
                  </Text>
                }
              />
            ) : (
              <View style={styles.emptyStateContainer}>
                <Icon name="money-off" size={64} color="#d0d0d0" />
                <Text style={styles.emptyStateText}>
                  No contributions found for {selectedUser.userName}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#6200ee",
  },
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#6200ee",
    paddingTop: 15,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
    color: "#fff",
  },
  statsCard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    flexDirection: "row",
    padding: 15,
    justifyContent: "space-between",
    alignItems: "center",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  statLabel: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 12,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: "70%",
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    marginHorizontal: 8,
  },
  mainContent: {
    flex: 1,
    padding: 20,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 20,
    height: 50,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 50,
    color: "#333",
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
    color: "#333",
  },
  usersList: {
    paddingBottom: 20,
  },
  userCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  userCardContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#6200ee",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  userInitial: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  totalContribution: {
    fontSize: 16,
    color: "#6200ee",
    fontWeight: "500",
  },
  userHistorySection: {
    flex: 1,
  },
  userHistoryHeader: {
    backgroundColor: "#6200ee",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  goBackButton: {
    marginRight: 15,
  },
  userHistoryTitleContainer: {
    flex: 1,
  },
  userHistoryTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  userHistorySubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
  },
  contributionsList: {
    padding: 20,
  },
  contributionCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    overflow: "hidden",
  },
  contributionHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#f7f7f7",
  },
  methodIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#6200ee",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  contributionInfo: {
    flex: 1,
  },
  contributionAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  contributionDate: {
    fontSize: 14,
    color: "#888",
  },
  contributionDetails: {
    padding: 15,
    backgroundColor: "#fff",
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  detailText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#555",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#888",
    fontSize: 16,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },
  emptyStateText: {
    marginTop: 15,
    textAlign: "center",
    color: "#888",
    fontSize: 16,
  },
});

export default ManageContributions;