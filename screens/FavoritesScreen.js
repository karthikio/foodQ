import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { collection, doc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase/firebaseConfig';

const FavoritesScreen = ({ navigation }) => {
  const [favorites, setFavorites] = useState([]);

  const userId = auth.currentUser?.uid;

  useEffect(() => {
    if (!userId) return;

    // Listen to real-time updates for the user's favorites
    const favoritesCollectionRef = collection(db, `favorites/${userId}/food`);
    const unsubscribe = onSnapshot(favoritesCollectionRef, (snapshot) => {
      const updatedFavorites = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setFavorites(updatedFavorites);
    });

    // Cleanup listener on component unmount
    return () => unsubscribe();
  }, [userId]);

  const handleRemoveFavorite = async (id) => {
    try {
      const favoriteDocRef = doc(db, `favorites/${userId}/food`, id);
      await deleteDoc(favoriteDocRef);
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  const renderFavoriteItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('MenuDetail', { item })}
    >
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.price}>Rs. {item.price}</Text>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveFavorite(item.id)}
        >
          <Text style={styles.removeText}>Remove</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {favorites.length > 0 ? (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id}
          renderItem={renderFavoriteItem}
          contentContainerStyle={styles.list}
        />
      ) : (
        <Text style={styles.emptyText}>You have no favorites yet.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  list: {
    paddingBottom: 20,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
  },
  image: {
    width: 100,
    height: 100,
  },
  info: {
    flex: 1,
    padding: 10,
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  price: {
    fontSize: 16,
    color: '#555',
  },
  removeButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#D24545',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
  },
  removeText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 18,
    color: '#aaa',
  },
});

export default FavoritesScreen;