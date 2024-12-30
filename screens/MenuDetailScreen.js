import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView
} from 'react-native';
import { collection, doc, setDoc } from 'firebase/firestore';
import { db, auth } from '../firebase/firebaseConfig'; // Adjust the import path

const MenuDetailScreen = ({ route, navigation }) => {
  const { item } = route.params;
  const [quantity, setQuantity] = useState(1);

  // const handleAddToCart = () => {
  //   // Implement cart logic here
  //   alert(`${item.name} added to cart!`);
  // };
  // 
  const handleAddToCart = async (item) => {
    try {
      const userId = auth.currentUser ?.uid;
      if (!userId) {
        alert('Please log in to add items to the cart.');
        return;
      }
  
      const cartRef = doc(db, `cart/${userId}/items`, item.id); // Document path for the item
      const cartItem = {
        ...item,
        quantity, // Use the quantity state
        total: item.price * quantity, // Calculate total based on quantity
      };
  
      await setDoc(cartRef, cartItem, { merge: true }); // Merge to update if the item already exists
      alert(`${item.name} added to cart!`);
    } catch (error) {
      alert('Error adding to cart: ' + error.message);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: item.image }} style={styles.image} />     
      <Text style={styles.name}>{item.name}</Text>
  
      <Text style={styles.price}>Rs. {item.price}</Text>
      <Text style={styles.description}>{item.description}</Text>

      {/* Preparing Time */}
      <Text style={styles.preparingTime}>Preparing Time: {item.preparingTime} minutes</Text>


    {/* Nutrition Info */}
    {item.nutrition && (
      <View style={styles.nutritionCard}>
        <Text style={styles.cardTitle}>Nutrition Information:</Text>
        {Object.entries(item.nutrition).map(([key, value]) => {
          // Map emojis based on the nutrient type
          const emojiMap = {
            protein: '💪', // Strong arm for protein
            kcal: '🔥', // Fire for calories
            fat: '🍔', // Burger for fat
            carbs: '🍞', // Bread for carbs
            sugar: '🍭', // Lollipop for sugar
            fiber: '🌱', // Plant for fiber
          };

      const emoji = emojiMap[key.toLowerCase()] || '🔍'; // Default emoji

        return (
          <Text key={key} style={styles.nutritionItem}>
            {emoji}  {key.charAt(0).toUpperCase() + key.slice(1)} - {value}
          </Text>
        );
      })}
      </View>
      )}  
    

      <View style={styles.quantityContainer}>
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => setQuantity((prev) => Math.max(1, prev - 1))}
        >
          <Text style={styles.quantityText}>-</Text>
        </TouchableOpacity>
        <Text style={styles.quantity}>{quantity}</Text>
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => setQuantity((prev) => prev + 1)}
        >
          <Text style={styles.quantityText}>+</Text>
        </TouchableOpacity>
      </View>

<TouchableOpacity
  style={styles.addToCartButton}
  onPress={() => handleAddToCart(item)}
>
  <Text style={styles.addToCartText}>Add to Cart</Text>
</TouchableOpacity>

      {/* <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
        <Text style={styles.addToCartText}>Add to Cart</Text>
      </TouchableOpacity> */}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  price: {
    fontSize: 20,
    color: '#777',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#555',
    marginBottom: 20
  },
  preparingTime: {
    fontSize: 16,
    color: '#555555',
    marginBottom: 20
  },
  nutritionCard: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  nutritionItem: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  quantityButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginHorizontal: 10,
  },
  quantityText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  quantity: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  addToCartButton: {
    backgroundColor: '#D24545',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  addToCartText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
});

export default MenuDetailScreen;