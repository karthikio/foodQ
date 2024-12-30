import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

const OrdersScreen = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = () => {
      const ordersRef = collection(db, 'orders');
      const q = query(ordersRef, orderBy('createdAt', 'desc')); // Order by latest

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const ordersData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setOrders(ordersData);
          setLoading(false);
        },
        (error) => {
          console.error('Error fetching orders:', error);
          Alert.alert('Error', 'Failed to fetch orders. Please try again later.');
          setLoading(false);
        }
      );

      return unsubscribe; // Clean up listener on unmount
    };

    const unsubscribe = fetchOrders();
    return () => unsubscribe();
  }, []);

  const renderOrderItem = ({ item }) => (
    <View style={styles.orderContainer}>
    <Text style={styles.orderId}>
      Order ID: {item.id.slice(-5)}
    </Text>      
    <Text style={styles.orderStatus}>
        Status:{' '}
        {item.cancelledAt ? (
          <Text style={styles.cancelled}>Order Cancelled</Text>
        ) : (
          <Text style={styles.active}>Active</Text>
        )}
      </Text>
      <Text style={styles.orderAmount}>Amount: ₹{item.amount}</Text>
      <Text style={styles.orderDate}>
        Date: {item.createdAt?.toDate().toLocaleString() || 'N/A'}
      </Text>
      <Text style={styles.orderItemsHeader}>Items:</Text>
      {item.items?.map((orderItem, index) => (
        <View key={index} style={styles.itemContainer}>
          <Text style={styles.itemName}>{orderItem.name}</Text>
          <Text style={styles.itemPrice}>₹{orderItem.total}</Text>
        </View>
      ))}
      <Text style={styles.note}>{item.note ? `Note: ${item?.note} ‼️` : ""}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : orders.length === 0 ? (
        <Text style={styles.noOrders}>No orders found.</Text>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={renderOrderItem}
          contentContainerStyle={styles.ordersList}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#343a40',
  },
  noOrders: {
    textAlign: 'center',
    fontSize: 18,
    color: '#6c757d',
  },
  orderContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007bff',
  },
  orderStatus: {
    fontSize: 16,
    marginTop: 5,
  },
  active: {
    color: '#28a745',
    fontWeight: 'bold',
  },
  cancelled: {
    color: '#dc3545',
    fontWeight: 'bold',
  },
  orderAmount: {
    fontSize: 16,
    marginTop: 5,
    color: '#343a40',
  },
  orderDate: {
    fontSize: 14,
    marginTop: 5,
    color: '#6c757d',
  },
  orderItemsHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#343a40',
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  itemName: {
    fontSize: 14,
    color: '#6c757d',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#343a40',
  },
  ordersList: {
    paddingBottom: 20,
  },
  note:{
    color: "#333333", 
    marginVertical: 4
  }
});

export default OrdersScreen;