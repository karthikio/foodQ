import React, { useRef, useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, Dimensions, FlatList, TouchableOpacity, Linking } from "react-native";
import MapView, { Marker } from "react-native-maps"; 


const { width } = Dimensions.get("window");

const data = [
  {
    image: require("../assets/images/pizza.png"),
    title: "Pizza",
    description: "Deliciously cheesy and loaded with toppings, our pizzas are perfect for any occasion.",
  },
  {
    image: require("../assets/images/coffee.png"),
    title: "Coffee",
    description: "Kickstart your day with our freshly brewed, aromatic coffee blends.",
  },
  {
    image: require("../assets/images/briyani.png"),
    title: "Biryani",
    description: "Savor the rich flavors of our authentic, aromatic biryani dishes.",
  },
  {
    image: require("../assets/images/burger.png"),
    title: "Burger",
    description: "Juicy and satisfying burgers with a variety of options to choose from.",
  },
  {
    image: require("../assets/images/sandwich.png"),
    title: "Sandwich",
    description: "Freshly made sandwiches with the perfect balance of flavors for a quick bite.",
  },
];

const HomeScreen = ({ navigation }) => {
  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Map location
  const location = {
    latitude: 11.2727277,
    longitude: 77.5878054,
  };

  // Function to auto-scroll to the next item
  const scrollToNext = () => {
    const nextIndex = (currentIndex + 1) % data.length;
    flatListRef.current.scrollToIndex({ index: nextIndex, animated: true });
    setCurrentIndex(nextIndex);
  };

  useEffect(() => {
    const interval = setInterval(scrollToNext, 3000); // Auto-scroll every 3 seconds
    return () => clearInterval(interval); // Clear interval on unmount
  }, [currentIndex]);

  // Redirect to Google Maps
  // const openGoogleMaps = () => {
  //   const url = `https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`;
  //   Linking.openURL(url).catch((err) => console.error("Failed to open Google Maps", err));
  // };

  const openGoogleMaps = () => {
    const url =
      "https://www.google.com/maps/place/Food+Court+@+KEC+(Hari+Krishna+Groups+)/@11.2727542,77.606778,21z/data=!4m14!1m7!3m6!1s0x3ba96d786c0e2813:0xcecfdf2909eb700a!2sFood+Court+@+KEC+(Hari+Krishna+Groups+)!8m2!3d11.2727277!4d77.6068598!16s%2Fg%2F1tdfrl2r!3m5!1s0x3ba96d786c0e2813:0xcecfdf2909eb700a!8m2!3d11.2727277!4d77.6068598!16s%2Fg%2F1tdfrl2r?entry=ttu&g_ep=EgoyMDI0MTIxMS4wIKXMDSoASAFQAw%3D%3D";

    Linking.openURL(url).catch((err) => {
      console.error("Failed to open URL:", err);
    });
  };

  const renderItem = ({ item }) => (
    <View style={styles.slide}>
      <Image source={item.image} style={styles.image} />
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.screenTitle}>"Welcome to FoodQ"</Text>
       {/* Map Card */}
       <View style={styles.mapCard}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.01, 
            longitudeDelta: 0.01,
          }}
        >
          <Marker
            coordinate={location}
            title="FoodQ Location"
            description="Click to open in Google Maps"
            onPress={openGoogleMaps}
          />
        </MapView>
        {/* <TouchableOpacity style={styles.mapButton} onPress={openGoogleMaps}>
          <Text style={styles.mapButtonText}>View in Google Maps</Text>
        </TouchableOpacity> */}
      </View>

      <FlatList
        ref={flatListRef}
        data={data}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScrollToIndexFailed={() => {}}
      />
     
      {/* <TouchableOpacity onPress={() => navigation.navigate("Menu")}>
        <Text style={styles.skip}>Go To Menu</Text>
      </TouchableOpacity> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    alignItems: "center",
  },
  screenTitle: {
    fontSize: 30,
    fontWeight: "900",
    marginTop: 40,
    color: "#A94438",
  },
  slide: {
    width,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  image: {
    width: "60%",
    height: 200,
    resizeMode: "contain",
    margin: 10,
    borderRadius: 20,
    backgroundColor: "#f5f6f7",
  },
  title: {
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 10,
    color: "#333",
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
  },
  skip: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
    backgroundColor: "#A94438",
    borderRadius: 20,
    paddingVertical: 10,
    width: "90%",
    textAlign: "center",
  },
  mapCard: {
    width: "90%",
    height: 180,
    marginVertical: 20,
    borderRadius: 10,
    overflow: "hidden",
    elevation: 4,
    backgroundColor: "#fff",
  },
  map: {
    flex: 1,
  },
  mapButton: {
    position: "absolute",
    bottom: 10,
    left: 10,
    right: 10,
    backgroundColor: "#A94438",
    borderRadius: 20,
    paddingVertical: 10,
    alignItems: "center",
  },
  mapButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default HomeScreen;