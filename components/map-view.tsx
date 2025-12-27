/**
 * Map view component - Wrapper for react-native-maps
 */

import React, { useRef, useEffect } from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT, MapPressEvent } from 'react-native-maps';
import { ThemedView } from './themed-view';
import { ThemedText } from './themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { LocationCoords } from '@/services/location';

interface MapViewComponentProps {
  currentLocation?:  LocationCoords;
  destination?: LocationCoords;
  route?: { lat: number; lng: number }[];
  showUserLocation?: boolean;
  onMapPress?: (coordinate: LocationCoords) => void;
  isSelectingDestination?: boolean;
}

export function MapViewComponent({
  currentLocation,
  destination,
  route,
  showUserLocation = true,
  onMapPress,
  isSelectingDestination = false,
}: MapViewComponentProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const mapRef = useRef<MapView>(null);
  const primaryColor = useThemeColor({}, 'primary' as any);

  // Center on current location when it becomes available
  useEffect(() => {
    if (currentLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }, 1000);
    }
  }, [currentLocation]);

  // Fit to show both markers when destination is set
  useEffect(() => {
    if (currentLocation && destination && mapRef.current && ! isSelectingDestination) {
      mapRef.current.fitToCoordinates(
        [
          { latitude: currentLocation.latitude, longitude: currentLocation.longitude },
          { latitude: destination.latitude, longitude: destination. longitude },
        ],
        {
          edgePadding: { top: 100, right: 50, bottom: 100, left:  50 },
          animated: true,
        }
      );
    }
  }, [currentLocation, destination, isSelectingDestination]);

  // Use current location or fallback
  const initialRegion = {
    latitude: currentLocation?.latitude || 33.8886, // Beirut, Lebanon default
    longitude: currentLocation?.longitude || 35.4955,
    latitudeDelta:  0.0922,
    longitudeDelta: 0.0421,
  };

  const handleMyLocation = () => {
    if (currentLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: currentLocation.latitude,
        longitude: currentLocation. longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }, 500);
    }
  };

  const handleMapPress = (event: MapPressEvent) => {
    if (onMapPress && isSelectingDestination) {
      const { latitude, longitude } = event.nativeEvent.coordinate;
      onMapPress({ latitude, longitude });
    }
  };

  return (
    <ThemedView style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_DEFAULT}
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation={showUserLocation}
        showsMyLocationButton={false}
        userInterfaceStyle={isDark ? 'dark' : 'light'}
        followsUserLocation={false}
        onPress={handleMapPress}
      >
        {/* Current location marker */}
        {currentLocation && (
          <Marker
            coordinate={{
              latitude: currentLocation.latitude,
              longitude: currentLocation. longitude,
            }}
            title="You are here"
            pinColor="blue"
          />
        )}

        {/* Destination marker */}
        {destination && (
          <Marker
            coordinate={{
              latitude:  destination.latitude,
              longitude: destination.longitude,
            }}
            title="Destination"
            pinColor="red"
            draggable={isSelectingDestination}
            onDragEnd={(e) => {
              if (onMapPress) {
                const { latitude, longitude } = e.nativeEvent. coordinate;
                onMapPress({ latitude, longitude });
              }
            }}
          />
        )}

        {/* Route polyline */}
        {route && route.length > 0 && (
          <Polyline
            coordinates={route. map((point) => ({
              latitude: point.lat,
              longitude: point.lng,
            }))}
            strokeColor="#00D9FF"
            strokeWidth={4}
          />
        )}
      </MapView>

      {/* Custom My Location Button - Bottom Right */}
      {currentLocation && (
        <View style={styles.buttonContainer}>
          <Pressable
            style={[styles.myLocationButton, { backgroundColor: primaryColor }]}
            onPress={handleMyLocation}
          >
            <ThemedText style={styles. locationIcon}>📍</ThemedText>
          </Pressable>
        </View>
      )}

      {/* Selection mode indicator */}
      {isSelectingDestination && (
        <View style={styles.selectionIndicator}>
          <View style={[styles.selectionBadge, { backgroundColor: primaryColor }]}>
            <ThemedText style={styles.selectionText}>
              📍 Tap map to set destination
            </ThemedText>
          </View>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet. create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 100,
    right: 16,
  },
  myLocationButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  locationIcon: {
    fontSize: 28,
  },
  selectionIndicator:  {
    position: 'absolute',
    top: 20,
    left: 16,
    right: 16,
    alignItems: 'center',
  },
  selectionBadge: {
    paddingHorizontal: 16,
    paddingVertical:  12,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  selectionText: {
    color: '#fff',
    fontSize:  14,
    fontWeight:  '600',
  },
});