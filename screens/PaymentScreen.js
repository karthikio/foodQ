import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  TextInput,
  Keyboard, 
  TouchableWithoutFeedback
} from 'react-native';
import { addDoc, collection, serverTimestamp, doc, updateDoc } from 'firebase/firestore'; // Use addDoc and collection
import { db, auth } from "../firebase/firebaseConfig"; 


const PaymentScreen = ({ route, navigation }) => {
  const { amount, userId, billItems } = route.params; 
  const [cancelTimer, setCancelTimer] = useState(120); 
  const [orderId, setOrderId] = useState(null);
  const [isCancelable, setIsCancelable] = useState(false);
  const [note, setNote] = useState('');

  useEffect(() => {
    if (cancelTimer > 0 && isCancelable) {
      const timer = setInterval(() => setCancelTimer((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (cancelTimer === 0) {
      setIsCancelable(false);
    }
  }, [cancelTimer, isCancelable]);


  const currentUser = auth.currentUser.uid;

  const handleCashPayment = async () => {

    try {
      // Add error checking for required fields
      if (!currentUser || !billItems || !amount) {
        throw new Error('Missing required order information');
      }

      const orderRef = collection(db, 'orders');
      const orderDoc = await addDoc(orderRef, {
        currentUser,
        items: billItems,
        amount,
        note: note,
        status: 'Pending',
        createdAt: serverTimestamp(),
        customerId: auth.currentUser?.uid, // Add customer ID for reference
      });

      setOrderId(orderDoc.id);
      setIsCancelable(true);
      Alert.alert('Success', 'Order placed successfully!');
    } catch (error) {
      console.error('Order placement error:', error); // Add logging
      Alert.alert(
        'Error', 
        'Failed to place order. Please check your connection and try again.'
      );
    }
  };

  const handleCancelOrder = async () => {
    try {
      if (!orderId) {
        Alert.alert('Error', 'No active order to cancel.');
        return;
      }

      const orderDocRef = doc(db, 'orders', orderId);
      await updateDoc(orderDocRef, {
        status: 'Cancelled',
        cancelledAt: serverTimestamp(),
      });
      
      setIsCancelable(false);
      Alert.alert('Success', 'Order cancelled successfully.');
    } catch (error) {
      console.error('Order cancellation error:', error); // Add logging
      Alert.alert(
        'Error',
        'Failed to cancel order. Please try again.'
      );
    }
  };

  const renderBillItem = ({ item }) => (
    <View style={styles.billItem}>
      <Text style={styles.billItemName}>{item.name}</Text>
      <Text style={styles.billItemPrice}>₹{item.total}</Text>
    </View>
  );

  return (
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
    <View style={styles.container}>
      <TextInput
        value={note}
        onChangeText={setNote}
        placeholder='Customize your order ✨'
        style={styles.note}
      />
      <Text style={styles.header}>Payment Screen</Text>

      <Text style={styles.amount}>Total Amount: ₹{amount}</Text>

      <Text style={styles.subHeader}>Bill Details:</Text>
      <FlatList
        data={billItems}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderBillItem}
        style={styles.billList}
      />

      <View style={styles.paymentButtons}>
        <TouchableOpacity style={styles.upiButton}   onPress={() => navigation.navigate("QrScreen", { amount })}
        >
          <Text style={styles.upiButtonText}>Pay with UPI</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cashButton} onPress={handleCashPayment}>
          <Text style={styles.cashButtonText}>Pay with Cash</Text>
        </TouchableOpacity>
      </View>

      {isCancelable && (
        <View style={styles.cancelContainer}>
          <TouchableOpacity
            style={[
              styles.cancelButton,
              { backgroundColor: cancelTimer > 0 ? '#dc3545' : '#6c757d' },
            ]}
            disabled={cancelTimer === 0}
            onPress={handleCancelOrder}
          >
            <Text style={styles.cancelButtonText}>
              {cancelTimer > 0
                ? `Cancel Order (${cancelTimer}s)`
                : 'Cancel Order Disabled'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f6f7',
    paddingBottom: 50,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
    textAlign: 'center',
  },
  note:{
    borderWidth: 1, 
    borderColor: "#cccccc",
    borderRadius: 10, 
    padding: 20, 
    marginVertical: 10, 
    marginBottom: 30
  }, 
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#333',
    textAlign: 'center',
  },
  subHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 20,
    color: '#333',
  },
  billList: {
    marginBottom: 20,
  },
  billItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  billItemName: {
    fontSize: 18,
    color: '#343a40',
  },
  billItemPrice: {
    fontSize: 18,
    color: '#333',
  },
  paymentButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 30,
  },
  upiButton: {
    backgroundColor: '#A94438',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  upiButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cashButton: {
    backgroundColor: '#D24545',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  cashButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelContainer: {
    marginTop: 30,
    alignItems: 'center',
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default PaymentScreen;