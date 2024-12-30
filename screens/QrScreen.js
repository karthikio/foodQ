import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Linking } from 'react-native';
import * as Clipboard from 'expo-clipboard';

const QrScreen = ({ route }) => {
  const { amount } = route.params; // Receive the amount
  const upiId = "developer.karthiksanthosh@okhdfcbank";

  const handleCopyToClipboard = () => {
    Clipboard.setStringAsync(upiId)
      .then(() => {
        Alert.alert("Success", "UPI ID copied to clipboard!");
      })
      .catch(() => {
        Alert.alert("Error", "Failed to copy UPI ID to clipboard.");
      });
  };

  const handlePayNow = () => {
    const upiUrl = `upi://pay?pa=${upiId}&pn=FoodQ&am=${amount}&cu=INR`;
    Linking.openURL(upiUrl).catch(() => {
      Alert.alert("Error", "No UPI app found on your device.");
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Complete Your Payment</Text>
      <View style={styles.infoContainer}>
        <Text style={styles.description}>
          To confirm your order, please complete the payment using the details below.
        </Text>
        <Text style={styles.upiText}>UPI ID: {upiId}</Text>
      </View>
      <TouchableOpacity style={styles.payButton} onPress={handlePayNow}>
        <Text style={styles.payButtonText}>Pay ₹{amount} Now</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.copyButton} onPress={handleCopyToClipboard}>
        <Text style={styles.copyButtonText}>Copy UPI ID</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f6f7",
    justifyContent: "flex-start",
    alignItems: "center",
    padding: 20,
    marginTop: 50
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#d35400",
    marginBottom: 20,
    textAlign: "center",
  },
  infoContainer: {
    marginBottom: 30,
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  description: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginBottom: 10,
  },
  upiText: {
    fontSize: 18,
    color: "#e74c3c",
    textAlign: "center",
  },
  copyButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginBottom: 15,
  },
  copyButtonText: {
    color: "#333333",
    fontSize: 16,
  },
  payButton: {
    backgroundColor: "#e74c3c",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    width: "100%", 
    alignItems: "center", 
    marginBottom: 20
  },
  payButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default QrScreen;