import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Image,
  Dimensions,
  KeyboardAvoidingView,
} from "react-native";
import { useAuth } from "../Auth/AuthContext";
import axios from "axios";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";

const Contribution = () => {
  const { user, isImpersonating, impersonatedUser } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);
  const [amount, setAmount] = useState("");
  // Pre-fill phone number from user
  const [paymentMethod, setPaymentMethod] = useState("");
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Auto-fill phone number on mount if available
  useEffect(() => {
    if (user && user.phone) {
      setPaymentMethod(user.phone);
    }
  }, [user]);

  const fetchContributions = () => {
    setLoading(true);
    const userId = isImpersonating ? impersonatedUser?._id : user?._id;
    console.log("Fetching transactions for user ID:", userId);

    if (userId) {
      axios
        .get(`https://mpesa-c874.vercel.app/api/mpesa/transactions/${userId}?t=${Date.now()}`)
        .then((response) => {
          // Use fallback in case response.data.data is undefined.
          const transactions = response.data.data || [];
          // Filter to only include transactions with status "completed" (case-insensitive)
          const completedTransactions = transactions.filter(
            (tx) => tx.status && tx.status.toLowerCase() === "completed"
          );
          setContributions(completedTransactions);
        })
        .catch((error) => {
          console.error(
            "Error fetching transactions:",
            error.response ? error.response.data : error.message
          );
          alert("Failed to fetch transactions");
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
    return contributions.reduce(
      (total, contribution) => total + (contribution.amount || 0),
      0
    );
  };

  const handleContribution = () => {
    if (amount && paymentMethod) {
      // Extract the logged-in user's ID
      const userId = isImpersonating ? impersonatedUser?._id : user?._id;
      console.log("Submitting:", paymentMethod, amount, "for userId:", userId);
      setSubmitting(true);

      axios
        .post(`https://mpesa-c874.vercel.app/api/mpesa/stkpush/${userId}`, {
          phoneNumber: paymentMethod,
          amount,
          userId,
        })
        .then((response) => {
          alert(`Payment initiated.`);
          setModalVisible(false);
          setAmount("");
          setPaymentMethod(user.phone);
          // Optionally, refresh contributions after a delay so the callback can update the status
          setTimeout(() => {
            fetchContributions();
          }, 5000);
        })
        .catch((error) => {
          console.error(
            "Error initiating payment:",
            error.response ? error.response.data : error.message
          );
          alert("Failed to initiate payment. Please try again.");
        })
        .finally(() => {
          setSubmitting(false);
        });
    } else {
      alert("Please fill all fields.");
    }
  };

  if (!user && !isImpersonating) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
        <View style={styles.emptyStateContainer}>
          <FontAwesome5 name="user-lock" size={60} color="#d1d9e6" />
          <Text style={styles.emptyStateTitle}>Authentication Required</Text>
          <Text style={styles.emptyStateText}>
            You must be logged in to view your contributions.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const displayName = isImpersonating ? impersonatedUser?.name : user?.name;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4527a0" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Contributions</Text>
        <Text style={styles.headerSubtitle}>
          {isImpersonating
            ? `${displayName} (impersonated)`
            : `${displayName || "User"}`}
        </Text>
      </View>

      {/* Summary Card */}
      <View style={styles.summaryCard}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total Contributions</Text>
          <Text style={styles.totalAmount}>
            KES {calculateTotalContributions().toFixed(2)}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.contributeButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.contributeButtonText}>Contribute</Text>
          <MaterialIcons name="arrow-forward" size={18} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* History Section */}
      <View style={styles.historyContainer}>
        <View style={styles.historyHeader}>
          <Text style={styles.historyTitle}>Contribution History</Text>
          <TouchableOpacity onPress={fetchContributions}>
            <MaterialIcons name="refresh" size={22} color="#5e35b1" />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#5e35b1" />
            <Text style={styles.loadingText}>
              Loading your contributions...
            </Text>
          </View>
        ) : contributions.length > 0 ? (
          <FlatList
            data={contributions}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <View style={styles.contributionItem}>
                <View style={styles.contributionLeft}>
                  <View style={styles.iconContainer}>
                    <FontAwesome5
                      name={
                        item.paymentMethod?.toLowerCase().includes("pesa")
                          ? "mobile-alt"
                          : "credit-card"
                      }
                      size={18}
                      color="#5e35b1"
                    />
                  </View>
                  <View style={styles.contributionDetails}>
                    <Text style={styles.paymentMethod}>
                      {item.paymentMethod || "Mpesa"}
                    </Text>
                    <Text style={styles.contributionDate}>
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "Unknown Date"}
                    </Text>
                  </View>
                </View>
                <Text style={styles.contributionAmount}>
                  KES {item.amount.toFixed(2)}
                </Text>
              </View>
            )}
            ListEmptyComponent={
              <View style={styles.emptyStateContainer}>
                <FontAwesome5 name="hands-helping" size={50} color="#d1d9e6" />
                <Text style={styles.emptyStateTitle}>No contributions yet</Text>
                <Text style={styles.emptyStateText}>
                  Make your first contribution today!
                </Text>
              </View>
            }
          />
        ) : (
          <View style={styles.emptyStateContainer}>
            <FontAwesome5 name="hands-helping" size={50} color="#d1d9e6" />
            <Text style={styles.emptyStateTitle}>No contributions yet</Text>
            <Text style={styles.emptyStateText}>
              Make your first contribution today!
            </Text>
          </View>
        )}
      </View>

      {/* Contribution Modal */}
      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior="padding"
          keyboardVerticalOffset={50}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>New Contribution</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <MaterialIcons name="close" size={24} color="#555" />
                </TouchableOpacity>
              </View>
              <View style={styles.modalBody}>
                <Text style={styles.inputLabel}>Phone Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., +254712345678"
                  placeholderTextColor="#aaa"
                  value={paymentMethod}
                  onChangeText={(text) => {
                    console.log("Phone number changed:", text);
                    setPaymentMethod(text);
                  }}
                />
                <Text style={styles.inputLabel}>Amount (KES)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter amount"
                  placeholderTextColor="#aaa"
                  keyboardType="numeric"
                  value={amount}
                  onChangeText={(text) => {
                    console.log("Amount changed:", text);
                    setAmount(text);
                  }}
                />
                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    (!amount || !paymentMethod) && styles.submitButtonDisabled,
                  ]}
                  onPress={handleContribution}
                  disabled={submitting || !amount || !paymentMethod}
                >
                  {submitting ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <>
                      <Text style={styles.submitButtonText}>Submit Contribution</Text>
                      <MaterialIcons name="send" size={18} color="#FFF" />
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    backgroundColor: "#5e35b1",
    paddingTop: 20,
    paddingBottom: 25,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "white",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.85)",
    fontWeight: "500",
  },
  summaryCard: {
    backgroundColor: "white",
    margin: 16,
    marginTop: -20,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  totalContainer: {
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
  },
  contributeButton: {
    backgroundColor: "#5e35b1",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
  },
  contributeButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 6,
  },
  historyContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  listContent: {
    paddingBottom: 20,
  },
  contributionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 10,
    marginBottom: 10,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  contributionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "rgba(94, 53, 177, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  contributionDetails: {
    flex: 1,
  },
  paymentMethod: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 2,
  },
  contributionDate: {
    fontSize: 14,
    color: "#888",
  },
  contributionAmount: {
    fontSize: 16,
    fontWeight: "700",
    color: "#5e35b1",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#666",
    fontSize: 14,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#555",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30,
    paddingTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  modalBody: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: "#555",
    marginBottom: 6,
    fontWeight: "500",
  },
  input: {
    backgroundColor: "#f5f5f5",
    padding: 14,
    borderRadius: 8,
    marginBottom: 18,
    color: "#333",
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  submitButton: {
    backgroundColor: "#5e35b1",
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  submitButtonDisabled: {
    backgroundColor: "#b39ddb",
  },
  submitButtonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 16,
    marginRight: 8,
  },
});

export default Contribution;
