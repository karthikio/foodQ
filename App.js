import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase/firebaseConfig'; // Update the path
import AuthScreen from './screens/AuthScreen';
import MainTabs from './navigation/MainTabs';
import MenuDetailScreen from './screens/MenuDetailScreen';
import AdminScreen from './screens/AdminScreen';
import BillScreen from './screens/BillScreen';
import CartScreen from './screens/CartScreen'; // Ensure CartScreen is imported
import { ActivityIndicator, View, StyleSheet } from 'react-native'; // Import ActivityIndicator for loading
import PaymentScreen from './screens/PaymentScreen';
import QrScreen from './screens/QrScreen';
import OrdersScreen from './screens/OrdersScreen';
import MyOrdersScreen from './screens/MyOrders';

const Stack = createNativeStackNavigator();

const App = () => {
  const [user, setUser ] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser ) => {
      setUser (currentUser );
      setLoading(false);
    });

    return unsubscribe; // Cleanup listener on unmount
  }, []);

  // if (loading) {
  //   return (
  //     <View style={styles.loadingContainer}>
  //       <ActivityIndicator size="small" color="#D24545" /> {/* Show loading indicator */}
  //     </View>
  //   );
  // }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {user ? (
          <>
            <Stack.Screen name="HomeTabs" component={MainTabs} options={{ headerShown: false }} />
            <Stack.Screen name="MenuDetail" component={MenuDetailScreen} options={{ headerTintColor: "#D24545", headerBackTitle: "Back" }} />
            <Stack.Screen name="AdminScreen" component={AdminScreen} options={{ headerTintColor: "#D24545", headerBackTitle: "Back" }} />
            <Stack.Screen name="Cart" component={CartScreen} options={{ title: 'Your Cart' }} />
            <Stack.Screen name="BillScreen" component={BillScreen} options={{ title: 'Bill Summary', headerTintColor: "#D24545" }} />
            <Stack.Screen name="PaymentScreen" component={PaymentScreen} options={{headerTintColor: "#D24545",}} />
            <Stack.Screen name="QrScreen" component={QrScreen} options={{headerTintColor: "#D24545",title: 'QR Screen'}} />
            <Stack.Screen name="OrdersScreen" component={OrdersScreen} options={{headerTintColor: "#D24545", title: 'Orders'}} />
            <Stack.Screen name="MyOrdersScreen" component={MyOrdersScreen} options={{headerTintColor: "#D24545", title: 'My Orders'}} />
          </>
        ) : (
          <Stack.Screen name="Auth" component={AuthScreen} options={{ headerShown: false }} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default App;