import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../firebase/firebaseConfig';

const MyOrdersScreen = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = auth.currentUser?.uid; // Get the current user ID
    if (!userId) return;

    const ordersQuery = query(
      collection(db, 'orders'),
      where("customerId", "==" , userId), 
    );

    const unsubscribe = onSnapshot(ordersQuery, (snapshot) => {
      const fetchedOrders = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setOrders(fetchedOrders);
      setLoading(false);
    });

    return () => unsubscribe(); // Cleanup the listener on component unmount
  }, []);

  const renderOrderItem = ({ item }) => (
    <View style={styles.orderContainer}>
      <Text style={styles.orderId}>Order ID: {item.id.slice(-5)}</Text>
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
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text>Loading your orders...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Orders</Text>
      {orders.length > 0 ? (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={renderOrderItem}
          contentContainerStyle={styles.ordersList}
        />
      ) : (
        <Text style={styles.noOrdersText}>You have no orders yet.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#343a40',
  },
  ordersList: {
    paddingBottom: 20,
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
  },
  cancelled: {
    color: '#dc3545',
  },
  orderAmount: {
    fontSize: 16,
    marginTop: 5,
  },
  orderDate: {
    fontSize: 16,
    marginTop: 5,
    color: '#6c757d',
  },
  orderItemsHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  itemName: {
    fontSize: 14,
    color: '#343a40',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noOrdersText: {
    fontSize: 18,
    color: '#6c757d',
    textAlign: 'center',
  },
});

export default MyOrdersScreen;