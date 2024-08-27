import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import initialLocations from './data/locations.json';

const icons = {
  church: require('./assets/church.png'),
  mountain: require('./assets/mountain.png'),
  shopping: require('./assets/shop.png'),
  attraction: require('./assets/attraction.png'),
  monument: require('./assets/monument.png'),
  business: require('./assets/business.png'),
};

export default function App() {
  const [locations, setLocations] = useState(initialLocations);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status === 'granted') {
        const { coords: { latitude, longitude } } = await Location.getCurrentPositionAsync();
        const coordinates = { latitude, longitude };

        updateDistances(coordinates);
      }
    }
    )();
  }, []);

  const toRadius = (deg) => {
    return deg * (Math.PI / 180);
  };

  const convertCoordsToKm = (origin, target) => {
    const R = 6371;

    const latRadians = toRadius(target.latitude - origin.latitude) / 2;
    const longRadians = toRadius(target.longitude - origin.longitude) / 2;

    const a = Math.pow(Math.sin(latRadians), 2) + Math.cos(toRadius(origin.latitude)) * Math.cos(toRadius(target.latitude)) * Math.pow(Math.sin(longRadians), 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return (R * c).toFixed(2);
  };

  const updateDistances = (userCoordinates) => {
    const newLocations = locations.map((data) => {
      return { ...data, distance: convertCoordsToKm(userCoordinates, data.coordinates) };
    });

    setLocations(newLocations);
  }

  const markers = locations.map((data, i) => {
    return (
      <Marker
        key={i}
        coordinate={data.coordinates}
        title={data.name}
        description={`${data.distance}km`}
        image={icons[data.type]}
        anchor={{ x: 0.5, y: 0.5 }}
      />
    );
  });

  return (
    <View style={styles.container}>
      <MapView style={styles.map} showsUserLocation>
        {markers}
      </MapView>

      <View style={styles.banner}>
        <Text style={[styles.text, styles.title]}>
          Mappulator
        </Text>

        <Text style={styles.text}>
          Tap a destination on the map to see how far away it is!
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  banner: {
    width: '100%',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 0,
    padding: 20,
    paddingBottom: 40,
    backgroundColor: '#343a40',
  },
  text: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 30,
    color: '#74d3ae',
  },
});
