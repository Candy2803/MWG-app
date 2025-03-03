import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";

const MoneyMarketStatements = () => {
  const statements = [
    { month: "January 2025", amount: "$5,000" },
    { month: "February 2025", amount: "$5,500" },
    { month: "March 2025", amount: "$6,000" },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.headerText}>Money Market Account Statements</Text>

      {statements.map((statement, index) => (
        <View key={index} style={styles.statementItem}>
          <Text style={styles.statementText}>{statement.month}</Text>
          <Text style={styles.statementAmount}>{statement.amount}</Text>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f0f0f5",
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  statementItem: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
  },
  statementText: {
    fontSize: 18,
    color: "#333",
  },
  statementAmount: {
    fontSize: 16,
    color: "#6200ee",
    fontWeight: "bold",
  },
});

export default MoneyMarketStatements;
