import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { collection, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../firebase/firebaseConfig';

const CartScreen = ({ navigation }) => {
  const [cart, setCart] = useState([]);
  const userId = auth.currentUser ? auth.currentUser.uid : null;

  useEffect(() => {
    if (!userId) return;

    const cartCollection = collection(db, `cart/${userId}/items`);
    const unsubscribe = onSnapshot(
      cartCollection,
      (snapshot) => {
        const updatedCart = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCart(updatedCart);
      },
      (error) => {
        console.error('Error fetching cart items:', error.message);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  const calculateTotal = () => cart.reduce((total, item) => total + item.total, 0);

  const removeItem = async (itemId) => {
    try {
      const itemDoc = doc(db, `cart/${userId}/items`, itemId);
      await deleteDoc(itemDoc);
      Alert.alert('Success', 'Item removed from the cart.');
    } catch (error) {
      console.error('Error removing item:', error.message);
      Alert.alert('Error', 'Failed to remove the item. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      {cart.length === 0 ? (
        <Text style={styles.emptyCartText}>Your cart is empty!</Text>
      ) : (
        <>
          <Text style={styles.header}>Your Cart</Text>
          <FlatList
            data={cart}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.item}>
                <Image source={{ uri: item.image }} style={styles.image} />
                <View style={styles.itemDetails}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.price}>₹{item.total}</Text>
                </View>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeItem(item.id)}
                >
                  <Text style={styles.removeText}>Remove</Text>
                </TouchableOpacity>
              </View>
            )}
          />
          <Text style={styles.total}>Total: ₹{calculateTotal()}</Text>
          <TouchableOpacity
            style={styles.checkoutButton}
            onPress={() => navigation.navigate('BillScreen', { total: calculateTotal(), cartItems: cart })}
          >
            <Text style={styles.checkoutText}>Proceed to Checkout</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  item: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, padding: 10, borderWidth: 1, borderColor: '#ccc', borderRadius: 10, alignItems: "center" },
  image: { width: 80, height: 80, marginRight: 10, borderRadius: 5 },
  itemDetails: { flex: 1, alignItems: "flex-start" },
  name: { fontSize: 18, fontWeight: 'bold' },
  price: { fontSize: 16, color: '#333', textAlign: 'right' },
  removeButton: { backgroundColor: '#D24545', padding: 8, borderRadius: 5, marginLeft: 10 },
  removeText: { color: 'white', fontSize: 14, fontWeight: 'bold' },
  total: { fontSize: 20, fontWeight: 'bold', marginTop: 20 },
  checkoutButton: { backgroundColor: '#A94438', padding: 15, borderRadius: 5, marginTop: 20 },
  checkoutText: { color: 'white', textAlign: 'center', fontSize: 18, fontWeight: 'bold' },
  emptyCartText: { fontSize: 18, textAlign: 'center', marginTop: 20 },
});

export default CartScreen;