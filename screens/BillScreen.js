// import React from 'react';
// import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';

// const BillScreen = ({ route, navigation }) => {
//   const { cartItems } = route.params; // Get cart items from route params

//   // Calculate total amount from cart items
//   const calculateTotalAmount = () => {
//     return cartItems.reduce((total, item) => total + item.total, 0);
//   };

//   const totalAmount = calculateTotalAmount(); // Calculate total amount

//   const renderItem = ({ item }) => (
//     <View style={styles.item}>
//       <Text style={styles.itemName}>{item.name}</Text>
//       <Text style={styles.itemPrice}>₹{item.total}</Text>
//     </View>
//   );

//   const handleProceedToPay = () => {
//     // Navigate to PaymentScreen with the total amount
//     navigation.navigate('PaymentScreen', { amount: totalAmount });
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.header}>Bill Summary</Text>
//       <FlatList
//         data={cartItems}
//         keyExtractor={(item) => item.id}
//         renderItem={renderItem}
//       />
//       <Text style={styles.total}>Total Amount: ₹{totalAmount}</Text>
//       <TouchableOpacity style={styles.payButton} onPress={handleProceedToPay}>
//         <Text style={styles.payText}>Proceed to Pay</Text>
//       </TouchableOpacity>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 20 },
//   header: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
//   item: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
//   itemName: { fontSize: 18 },
//   itemPrice: { fontSize: 18 },
//   total: { fontSize: 20, fontWeight: 'bold', marginTop: 20 },
//   payButton: {
//     backgroundColor: '#4CAF50',
//     padding: 15,
//     borderRadius: 5,
//     marginTop: 20,
//   },
//   payText: {
//     color: 'white',
//     textAlign: 'center',
//     fontWeight: 'bold',
//   },
// });

// export default BillScreen;


import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import * as Location from 'expo-location';

const BillScreen = ({ route, navigation }) => {
  const { cartItems } = route.params; // Get cart items from route params

  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);


  const collegeLocation = { latitude: 11.2744489, longitude: 77.6044563}; // Example: College latitude and longitude (Bengaluru)

  // Function to calculate total amount from cart items
  const calculateTotalAmount = () => {
    return cartItems.reduce((total, item) => total + item.total, 0);
  };

  const totalAmount = calculateTotalAmount(); // Calculate total amount

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Text style={styles.itemName}>{item.name}</Text>
      <Text style={styles.itemPrice}>₹{item.total}</Text>
    </View>
  );

  const getCurrentLocation = async () => {
    try {
      // Request permission for location
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      // Get the current location
      let location = await Location.getCurrentPositionAsync({});
      setLocation(location.coords);
    } catch (error) {
      setErrorMsg('Failed to fetch location');
    }
  };

  const isInRange = (location, targetLocation, rangeInKm) => {
    const { latitude: userLat, longitude: userLong } = location;
    const { latitude: targetLat, longitude: targetLong } = targetLocation;

    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371; // Radius of the Earth in km
    const dLat = toRad(targetLat - userLat);
    const dLong = toRad(targetLong - userLong);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(userLat)) *
        Math.cos(toRad(targetLat)) *
        Math.sin(dLong / 2) *
        Math.sin(dLong / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km

    return distance <= rangeInKm;
  };

  const handleProceedToPay = () => {
    if (!location) {
      Alert.alert('Location Error', 'Unable to determine your current location.');
      return;
    }

    //3 km
    // Check if user is within 3km radius of the college
    if (isInRange(location, collegeLocation, 3)) {
      // Proceed to payment screen
      navigation.navigate('PaymentScreen', { amount: totalAmount, billItems: cartItems });
    } else {
      Alert.alert('Location Error', 'You are not inside the college. Please come within 3km radius to proceed.');
    }
  };

  useEffect(() => {
    getCurrentLocation(); // Get current location when the screen mounts
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Bill Summary</Text>
      <FlatList
        data={cartItems}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
      />
      <Text style={styles.total}>Total Amount: ₹{totalAmount}</Text>
      <TouchableOpacity style={styles.payButton} onPress={handleProceedToPay}>
        <Text style={styles.payText}>Proceed to Pay</Text>
      </TouchableOpacity>

      {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  item: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  itemName: { fontSize: 18 },
  itemPrice: { fontSize: 18 },
  total: { fontSize: 20, fontWeight: 'bold', marginTop: 20 },
  payButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 5,
    marginTop: 20,
    marginBottom: 40
  },
  payText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default BillScreen;
