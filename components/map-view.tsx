/**
 * Map view component - Wrapper for react-native-maps
 */

import React from 'react';
import { StyleSheet } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from 'react-native-maps';
import { ThemedView } from './themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { LocationCoords } from '@/services/location';

interface MapViewComponentProps {
  currentLocation?: LocationCoords;
  destination?: LocationCoords;
  route?: { lat: number; lng: number }[];
  showUserLocation?: boolean;
}

export function MapViewComponent({
  currentLocation,
  destination,
  route,
  showUserLocation = true,
}: MapViewComponentProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Default to a central location if no location provided
  const initialRegion = {
    latitude: currentLocation?.latitude || 37.78825,
    longitude: currentLocation?.longitude || -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  return (
    <ThemedView style={styles.container}>
      <MapView
        provider={PROVIDER_DEFAULT}
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation={showUserLocation}
        showsMyLocationButton={true}
        userInterfaceStyle={isDark ? 'dark' : 'light'}
      >
        {/* Current location marker */}
        {currentLocation && (
          <Marker
            coordinate={{
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude,
            }}
            title="You are here"
            pinColor="blue"
          />
        )}

        {/* Destination marker */}
        {destination && (
          <Marker
            coordinate={{
              latitude: destination.latitude,
              longitude: destination.longitude,
            }}
            title="Destination"
            pinColor="red"
          />
        )}

        {/* Route polyline */}
        {route && route.length > 0 && (
          <Polyline
            coordinates={route.map((point) => ({
              latitude: point.lat,
              longitude: point.lng,
            }))}
            strokeColor="#00D9FF"
            strokeWidth={4}
          />
        )}
      </MapView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
});
