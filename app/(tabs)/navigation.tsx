import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Platform, TextInput, Pressable, Alert } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MapViewComponent } from '@/components/map-view';
import { StatCard } from '@/components/stat-card';
import { useLocation } from '@/hooks/use-location';
import { useThemeColor } from '@/hooks/use-theme-color';
import { routeCalculator, Route } from '@/services/route-calculator';
import { LocationCoords } from '@/services/location';

export default function NavigationScreen() {
  const { location, hasPermission, getCurrentLocation, requestPermission } = useLocation();
  const [destination, setDestination] = useState<LocationCoords | null>(null);
  const [route, setRoute] = useState<Route | null>(null);
  const [destinationInput, setDestinationInput] = useState('');
  const cardBackground = useThemeColor({}, 'cardBackground' as any);
  const borderColor = useThemeColor({}, 'border' as any);
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'primary' as any);

  // Get current location on mount
  useEffect(() => {
    const initLocation = async () => {
      if (!hasPermission) {
        await requestPermission();
      } else {
        await getCurrentLocation();
      }
    };
    initLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSetDestination = async () => {
    // For demo purposes, set a destination near current location
    // In production, would use geocoding API to convert address to coordinates
    if (!location) {
      Alert.alert('Location Error', 'Current location not available');
      return;
    }

    // Simulate destination (0.05 degrees offset = ~5.5km)
    const mockDestination: LocationCoords = {
      latitude: location.latitude + 0.05,
      longitude: location.longitude + 0.05,
    };

    setDestination(mockDestination);

    // Calculate route
    try {
      const calculatedRoute = await routeCalculator.calculateRoute(
        location,
        mockDestination
      );
      setRoute(calculatedRoute);
    } catch (error) {
      console.error('Route calculation error:', error);
      Alert.alert('Route Error', 'Failed to calculate route');
    }
  };

  const handleClearRoute = () => {
    setDestination(null);
    setRoute(null);
    setDestinationInput('');
  };

  if (!hasPermission) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.permissionContainer}>
          <ThemedText style={styles.permissionText}>
            📍 Location permission required
          </ThemedText>
          <Pressable
            style={[styles.button, { backgroundColor: primaryColor }]}
            onPress={requestPermission}
          >
            <ThemedText style={styles.buttonText}>Grant Permission</ThemedText>
          </Pressable>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* Map */}
      <View style={styles.mapContainer}>
        <MapViewComponent
          currentLocation={location || undefined}
          destination={destination || undefined}
          route={route?.points}
          showUserLocation={true}
        />
      </View>

      {/* Controls Overlay */}
      <View style={styles.overlay}>
        {/* Search/Destination Input */}
        <View style={[styles.searchContainer, { backgroundColor: cardBackground, borderColor }]}>
          <TextInput
            style={[styles.searchInput, { color: textColor }]}
            placeholder="Enter destination (demo mode)"
            placeholderTextColor={`${textColor}80`}
            value={destinationInput}
            onChangeText={setDestinationInput}
          />
          {!destination ? (
            <Pressable
              style={[styles.searchButton, { backgroundColor: primaryColor }]}
              onPress={handleSetDestination}
            >
              <ThemedText style={styles.searchButtonText}>Set</ThemedText>
            </Pressable>
          ) : (
            <Pressable
              style={[styles.searchButton, { backgroundColor: '#F44336' }]}
              onPress={handleClearRoute}
            >
              <ThemedText style={styles.searchButtonText}>Clear</ThemedText>
            </Pressable>
          )}
        </View>

        {/* Route Info */}
        {route && (
          <View style={styles.routeInfo}>
            <View style={styles.routeStats}>
              <StatCard
                label="Distance"
                value={routeCalculator.formatDistance(route.distance)}
                icon="📍"
                size="small"
              />
              <StatCard
                label="Est. Time"
                value={routeCalculator.formatTime(route.estimatedTime)}
                icon="⏱️"
                size="small"
              />
            </View>
          </View>
        )}
      </View>

      {/* Current Location Info */}
      {location && (
        <View style={[styles.locationInfo, { backgroundColor: cardBackground, borderColor }]}>
          <ThemedText style={styles.locationText}>
            📍 {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
          </ThemedText>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainer: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 20,
    left: 16,
    right: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    padding: 8,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingHorizontal: 8,
  },
  searchButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  routeInfo: {
    marginTop: 12,
  },
  routeStats: {
    flexDirection: 'row',
    gap: 12,
  },
  locationInfo: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  locationText: {
    fontSize: 12,
    fontWeight: '500',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionText: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
