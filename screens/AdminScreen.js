import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, FlatList, Image } from 'react-native';
import { db } from '../firebase/firebaseConfig';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Picker } from '@react-native-picker/picker';
import { FontAwesome } from '@expo/vector-icons'; // Importing FontAwesome for the search icon

const AdminScreen = () => {
  const [menu, setMenu] = useState({
    name: '',
    preparingTime: '',
    description: '',
    image: '',
    price: '',
    customizable: false,
  });
  const [nutrition, setNutrition] = useState({});
  const [selectedNutrient, setSelectedNutrient] = useState('');
  const [nutrientValue, setNutrientValue] = useState('');
  const [menuItems, setMenuItems] = useState([]);
  const [filteredMenuItems, setFilteredMenuItems] = useState([]);
  const [selectedMenuItem, setSelectedMenuItem] = useState(null);
  const [searchText, setSearchText] = useState('');

  // Fetch menu items from Firestore
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'menu'));
        const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMenuItems(items);
        setFilteredMenuItems(items); // Initialize filtered menu items with all items
      } catch (error) {
        console.error('Error fetching menu items:', error.message);
      }
    };

    fetchMenuItems();
  }, []);

  // Update search text and filter the menu items
  const handleSearch = (text) => {
    setSearchText(text);
    if (text.trim() === '') {
      setFilteredMenuItems(menuItems); // If search is cleared, show all items
    } else {
      const filteredItems = menuItems.filter(item =>
        item.name.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredMenuItems(filteredItems);
    }
  };

  // Add new menu item to Firestore
  const addMenuToFirestore = async () => {
    const { name, preparingTime, description, image, price, customizable } = menu;

    if (!name || !preparingTime || !description || !image || !price) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    try {
      const newMenu = {
        ...menu,
        price: parseInt(price, 10),
        nutrition,
        createdAt: new Date(),
      };

      const collectionRef = collection(db, 'menu');
      const docRef = await addDoc(collectionRef, newMenu);

      // Update local state immediately
      setMenuItems(prevItems => [...prevItems, { id: docRef.id, ...newMenu }]);
      setFilteredMenuItems(prevItems => [...prevItems, { id: docRef.id, ...newMenu }]);

      Alert.alert('Success', 'Menu item added successfully!');
      setMenu({
        name: '',
        preparingTime: '',
        description: '',
        image: '',
        price: '',
        customizable: false,
      });
      setNutrition({});
    } catch (error) {
      console.error('Error adding menu item:', error.message);
    }
  };

  // Update menu item
  const updateMenuItem = async () => {
    if (!selectedMenuItem) {
      Alert.alert('Error', 'Please select a menu item to update');
      return;
    }

    const { id } = selectedMenuItem;
    const updatedMenu = {
      ...selectedMenuItem,
      name: menu.name || selectedMenuItem.name,
      preparingTime: menu.preparingTime || selectedMenuItem.preparingTime,
      image: menu.image || selectedMenuItem.image,
      price: parseInt(menu.price, 10) || selectedMenuItem .price,
      nutrition,
    };

    try {
      const docRef = doc(db, 'menu', id);
      await updateDoc(docRef, updatedMenu);

      // Update local state immediately
      setMenuItems(prevItems => 
        prevItems.map(item => (item.id === id ? { ...item, ...updatedMenu } : item))
      );
      setFilteredMenuItems(prevItems => 
        prevItems.map(item => (item.id === id ? { ...item, ...updatedMenu } : item))
      );

      Alert.alert('Success', 'Menu item updated successfully!');
      setSelectedMenuItem(null); // Deselect the item
      setMenu({ name: '', preparingTime: '', description: '', image: '', price: '', customizable: false });
      setNutrition({});
    } catch (error) {
      console.error('Error updating menu item:', error.message);
    }
  };

  // Delete menu item
  const deleteMenuItem = async (id) => {
    try {
      const docRef = doc(db, 'menu', id);
      await deleteDoc(docRef);

      // Update local state immediately
      setMenuItems(prevItems => prevItems.filter(item => item.id !== id));
      setFilteredMenuItems(prevItems => prevItems.filter(item => item.id !== id));

      Alert.alert('Success', 'Menu item deleted successfully!');
    } catch (error) {
      console.error('Error deleting menu item:', error.message);
    }
  };

  // Select a menu item to edit
  const selectMenuItemToEdit = (item) => {
    setSelectedMenuItem(item);
    setMenu({
      name: item.name,
      preparingTime: item.preparingTime,
      description: item.description,
      image: item.image,
      price: item.price.toString(),
      customizable: item.customizable,
    });
    setNutrition(item.nutrition);
  };

  // Add nutrition data
  const addNutrient = () => {
    if (!selectedNutrient || !nutrientValue) {
      Alert.alert('Error', 'Please select a nutrient and provide its value');
      return;
    }

    setNutrition((prev) => ({
      ...prev,
      [selectedNutrient]: parseInt(nutrientValue, 10),
    }));

    setSelectedNutrient('');
    setNutrientValue('');
  };

  return (
    <View style={styles.container}>
    <FlatList
      ListHeaderComponent={
        <>
          <Text style={styles.title}>Add / Edit Menu Item</Text>
          
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <FontAwesome name="search" size={20} color="#ccc" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name..."
              value={searchText}
              onChangeText={handleSearch}
            />
          </View>
          
          {/* Add/Edit Menu Item Form */}
          <TextInput
            style={styles.input}
            placeholder="Name"
            value={menu.name}
            onChangeText={(text) => setMenu({ ...menu, name: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Preparing Time"
            value={menu.preparingTime}
            onChangeText={(text) => setMenu({ ...menu, preparingTime: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Description"
            value={menu.description}
            onChangeText={(text) => setMenu({ ...menu, description: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Image URL"
            value={menu.image}
            onChangeText={(text) => setMenu({ ...menu, image: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Price"
            keyboardType="numeric"
            value={menu.price}
            onChangeText={(text) => setMenu({ ...menu, price: text })}
          />
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={() => setMenu({ ...menu, customizable: !menu.customizable })}
          >
            <Text style={styles.toggleText}>
              {menu.customizable ? 'Customizable: Yes' : 'Customizable: No'}
            </Text>
          </TouchableOpacity>
          
          <Text style={styles.subtitle}>Add Nutrition</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedNutrient}
              onValueChange={(itemValue) => setSelectedNutrient(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Protein" value="protein" />
              <Picker.Item label="Kcal" value="kcal" />
              <Picker.Item label="Fat" value="fat" />
              <Picker.Item label=" Carbs" value="carbs" />
              <Picker.Item label="Fiber" value="fiber" />
              <Picker.Item label="Sugar" value="sugar" />
            </Picker>
          </View>
          
          <TextInput
            style={styles.input}
            placeholder="Value"
            keyboardType="numeric"
            value={nutrientValue}
            onChangeText={(text) => setNutrientValue(text)}
          />
          <TouchableOpacity style={styles.addButton} onPress={addNutrient}>
            <Text style={styles.addButtonText}>Add Nutrient</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.submitButton} onPress={selectedMenuItem ? updateMenuItem : addMenuToFirestore}>
            <Text style={styles.submitButtonText}>{selectedMenuItem ? 'Update Menu' : 'Add Menu'}</Text>
          </TouchableOpacity>
        </>
      }
      data={filteredMenuItems}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.menuItem}>
          <View style={styles.itemContent}>
            <Image source={{ uri: item.image }} style={styles.itemImage} />
            <Text style={styles.menuItemText}>{item.name}</Text>
          </View>
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => selectMenuItemToEdit(item)}
            >
              <Text style={styles.buttonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => deleteMenuItem(item.id)}
            >
              <Text style={styles.buttonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    />
  </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f8f8f8',
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginVertical: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  toggleButton: {
    padding: 15,
    backgroundColor: '#D24545',
    borderRadius: 5,
    marginVertical: 10,
  },
  toggleText: {
    color: '#fff',
    textAlign: 'center',
  },
  pickerContainer: {
    marginBottom: 15,
  },
  picker: {
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  addButton: {
    backgroundColor: '#D24545',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  addButtonText: {
    color: '#fff',
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: '#D24545',
    padding: 15,
    borderRadius: 5,
    marginTop: 20,
  },
  submitButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    marginTop: 20
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 5,
    marginRight: 10,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  deleteButton: {
    backgroundColor: '#D24545',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
  },
});

export default AdminScreen;