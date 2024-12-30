import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase/firebaseConfig';
import { Ionicons } from 'react-native-vector-icons';

const MenuScreen = ({ navigation }) => {
  const [menu, setMenu] = useState([]);
  const [filteredMenu, setFilteredMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [favorites, setFavorites] = useState(new Set());

  const userId = auth.currentUser.uid;

  useEffect(() => {
    // Real-time listener for menu collection
    const unsubscribeMenu = onSnapshot(
      collection(db, 'menu'),
      (snapshot) => {
        const menuList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMenu(menuList);
        setFilteredMenu(menuList); // Initially, filtered menu is the same as the full menu
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching menu data:', error);
      }
    );

    // Real-time listener for user's favorites
    const unsubscribeFavorites = onSnapshot(
      collection(db, `favorites/${userId}/food`),
      (snapshot) => {
        const favoriteItems = new Set(snapshot.docs.map((doc) => doc.id));
        setFavorites(favoriteItems);
      },
      (error) => {
        console.error('Error fetching favorites:', error);
      }
    );

    // Cleanup subscriptions on unmount
    return () => {
      unsubscribeMenu();
      unsubscribeFavorites();
    };
  }, [userId]);

  const handleSearch = (text) => {
    setSearchText(text);
    if (text.trim() === '') {
      setFilteredMenu(menu);
    } else {
      const filtered = menu.filter((item) =>
        item.name.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredMenu(filtered);
    }
  };

  const handleFavoriteToggle = async (item) => {
    const favoriteDocRef = doc(db, `favorites/${userId}/food`, item.id);

    try {
      if (favorites.has(item.id)) {
        // Remove from favorites
        await deleteDoc(favoriteDocRef);
        setFavorites((prevFavorites) => {
          const updatedFavorites = new Set(prevFavorites);
          updatedFavorites.delete(item.id);
          return updatedFavorites;
        });
      } else {
        // Add to favorites
        await setDoc(favoriteDocRef, item);
        setFavorites((prevFavorites) => new Set(prevFavorites.add(item.id)));
      }
    } catch (error) {
      console.error('Error updating favorites:', error);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() =>
        navigation.navigate('MenuDetail', {
          item, // Pass the full item object to the detail page
        })
      }
    >
      <Image source={{ uri: item.image }} style={styles.itemImage} />
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.name}</Text>
        <View style={styles.itemFooter}>
          <Text style={styles.itemPrice}>Rs. {item.price}</Text>
          <TouchableOpacity onPress={() => handleFavoriteToggle(item)}>
            <Ionicons
              name={favorites.has(item.id) ? 'heart' : 'heart-outline'}
              size={24}
              color={favorites.has(item.id) ? 'red' : 'gray'}
            />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="small" color="#D24545" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search menu..."
        value={searchText}
        onChangeText={handleSearch}
      />
      {filteredMenu.length > 0 ? (
        <FlatList
          data={filteredMenu}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <Text style={styles.emptyText}>No items found.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    paddingTop: 30,
    backgroundColor: '#fff',
  },
  searchInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
    paddingHorizontal: 10,
    backgroundColor: '#f9f9f9',
    marginRight: 10
  },
  listContainer: {
    paddingBottom: 20,
  },
  itemContainer: {
    flex: 1,
    flexDirection: 'column',
    padding: 10,
    marginBottom: 10,
    marginRight: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  itemImage: {
    width: '100%',
    height: 120,
    borderRadius: 5,
    marginBottom: 10,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: 5,
  },
  itemPrice: {
    fontSize: 14,
    color: '#777',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#aaa',
    marginTop: 20,
  },
});

export default MenuScreen;