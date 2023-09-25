import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, StatusBar, TouchableOpacity, TextInput, Text } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import parkingsData from 'smartcity/st_park_p.json';

function deg2rad(deg) {
  return deg * (Math.PI/180)
}

export default function App() {
  const [location, setLocation] = useState(null);
  const [showParkings, setShowParkings] = useState(true);
  const [displayedParkings, setDisplayedParkings] = useState(parkingsData);
  const [address, setAddress] = useState('');

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        //Alert.alert('Permission refusée', 'Impossible d\'accéder à la localisation');
        return;
      }
      let userLocation = await Location.getCurrentPositionAsync({});
      setLocation(userLocation.coords);
    })();
  }, []);

  const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon/2) * Math.sin(dLon/2)
    ;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const d = R * c; // Distance in km
    return d;
  };

  const findNearestParkings = userCoords => {
    const sortedParkings = parkingsData.sort((a, b) => 
      getDistanceFromLatLonInKm(userCoords.latitude, userCoords.longitude, a.geo_point_2d.lat, a.geo_point_2d.lon) -
      getDistanceFromLatLonInKm(userCoords.latitude, userCoords.longitude, b.geo_point_2d.lat, b.geo_point_2d.lon)
    );
    setDisplayedParkings(sortedParkings.slice(0, 3));
  };

  const findParkingsFromAddress = async inputAddress => {
    // Simulating an address to coordinates conversion.
    // In a real-world scenario, you would use an actual geocoding service.
    const simulatedCoordsFromAddress = { latitude: 44.8378, longitude: -0.5792 }; // This should come from a geocoding service
    findNearestParkings(simulatedCoordsFromAddress);
  };


  return (
    <View style={styles.container}>
      <View style={styles.buttonGroup}>
        <TextInput
          style={styles.input}
          onChangeText={setAddress}
          value={address}
          placeholder="Entrez une adresse"
        />
        <TouchableOpacity style={styles.button} onPress={() => findParkingsFromAddress(address)}>
          <Text style={styles.buttonText}>3 plus proches de l'adresse</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => findNearestParkings(location)}>
          <Text style={styles.buttonText}>3 plus proches de moi</Text>
        </TouchableOpacity>
      </View>
      
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: location ? location.latitude : 44.8378,
          longitude: location ? location.longitude : -0.5792,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        {showParkings && displayedParkings.map((parking, index) => (
          <Marker
            key={index}
            coordinate={{
              latitude: parking.geo_point_2d.lat,
              longitude: parking.geo_point_2d.lon,
            }}
            title={parking.nom}
            description={parking.adresse}
          />
        ))}
        {location && (
          <Marker 
            coordinate={location}
            title="Votre position"
            pinColor="blue" 
          />
        )}
      </MapView>

      <View style={styles.buttonGroupBottom}>
        <TouchableOpacity style={styles.button} onPress={() => setShowParkings(true)}>
          <Text style={styles.buttonText}>Afficher les parkings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => setShowParkings(false)}>
          <Text style={styles.buttonText}>Cacher les parkings</Text>
        </TouchableOpacity>
      </View>

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  map: {
    flex: 1,
  },
  buttonGroup: {
    position: 'absolute',
    top: '10%',
    left: 10,
    right: 10,
    zIndex: 1000,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buttonGroupBottom: {
    position: 'absolute',
    bottom: '10%',
    left: 10,
    right: 10,
    zIndex: 1000,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 8,
    marginHorizontal: 5,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
  },
  input: {
    flex: 1,
    borderColor: 'gray',
    borderWidth: 1,
    backgroundColor: 'white',
    padding: 10,
    marginRight: 5,
    borderRadius: 8,
  },
});

