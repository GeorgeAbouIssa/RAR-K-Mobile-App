import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Platform, TextInput, Pressable, Alert, FlatList, Keyboard } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MapViewComponent } from '@/components/map-view';
import { StatCard } from '@/components/stat-card';
import { useLocation } from '@/hooks/use-location';
import { useThemeColor } from '@/hooks/use-theme-color';
import { routeCalculator, Route } from '@/services/route-calculator';
import { geocodingService, GeocodeResult } from '@/services/geocoding-service';
import { LocationCoords } from '@/services/location';

export default function NavigationScreen() {
  const { location, hasPermission, isLoading, getCurrentLocationWithRetry, requestPermission } = useLocation();
  const [destination, setDestination] = useState<LocationCoords | null>(null);
  const [route, setRoute] = useState<Route | null>(null);
  const [destinationInput, setDestinationInput] = useState('');
  const [isSelectingOnMap, setIsSelectingOnMap] = useState(false);
  const [searchResults, setSearchResults] = useState<GeocodeResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  
  const cardBackground = useThemeColor({}, 'cardBackground' as any);
  const borderColor = useThemeColor({}, 'border' as any);
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'primary' as any);

  // Automatically get location on mount with retry
  useEffect(() => {
    const initLocation = async () => {
      if (hasPermission) {
        await getCurrentLocationWithRetry();
      }
    };
    
    initLocation();
  }, [hasPermission]);

  const handleSearch = async () => {
    if (destinationInput.trim().length < 3) {
      Alert.alert('Search Error', 'Please enter at least 3 characters');
      return;
    }

    setIsSearching(true);
    const results = await geocodingService.searchAddress(destinationInput);
    setSearchResults(results);
    setShowResults(results.length > 0);
    setIsSearching(false);

    if (results.length === 0) {
      Alert.alert('No Results', 'No locations found for your search');
    }
  };

  const calculateRouteToDestination = async (dest: LocationCoords) => {
    if (!location) {
      Alert.alert('Location Error', 'Current location not available');
      return;
    }

    try {
      const calculatedRoute = await routeCalculator. calculateRoute(location, dest);
      setRoute(calculatedRoute);
    } catch (error) {
      console.error('Route calculation error:', error);
      Alert.alert('Route Error', 'Failed to calculate route');
    }
  };

  const handleMapPress = async (coordinate: LocationCoords) => {
    setDestination(coordinate);
    setIsSelectingOnMap(false);
    setShowResults(false);
    
    // Reverse geocode to get address
    const address = await geocodingService.reverseGeocode(coordinate);
    if (address) {
      setDestinationInput(address);
    }
    
    await calculateRouteToDestination(coordinate);
  };

  const handleSelectSearchResult = async (result: GeocodeResult) => {
    const dest:  LocationCoords = {
      latitude: result.latitude,
      longitude: result.longitude,
    };
    
    setDestination(dest);
    setDestinationInput(result.displayName);
    setShowResults(false);
    Keyboard.dismiss();
    
    await calculateRouteToDestination(dest);
  };

  const handleSelectOnMap = () => {
    setIsSelectingOnMap(true);
    setDestination(null);
    setRoute(null);
    setShowResults(false);
    Keyboard.dismiss();
  };

  const handleClearRoute = () => {
    setDestination(null);
    setRoute(null);
    setDestinationInput('');
    setIsSelectingOnMap(false);
    setSearchResults([]);
    setShowResults(false);
    Keyboard.dismiss();
  };

  const handleSafetyReset = () => {
    Alert.alert(
      'Reset Navigation',
      'This will clear all navigation data and restart.  Continue?',
      [
        { text: 'Cancel', style:  'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            // Full reset
            setDestination(null);
            setRoute(null);
            setDestinationInput('');
            setIsSelectingOnMap(false);
            setSearchResults([]);
            setShowResults(false);
            setIsSearching(false);
            Keyboard.dismiss();
            
            // Retry getting location
            getCurrentLocationWithRetry();
          },
        },
      ]
    );
  };

  if (! hasPermission) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.permissionContainer}>
          <ThemedText style={styles.permissionText}>
            📍 Location permission required
          </ThemedText>
          <Pressable
            style={[styles.button, { backgroundColor: primaryColor }]}
            onPress={async () => {
              const granted = await requestPermission();
              if (granted) {
                await getCurrentLocationWithRetry();
              }
            }}
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
          route={route?. points}
          showUserLocation={true}
          onMapPress={handleMapPress}
          isSelectingDestination={isSelectingOnMap}
        />
      </View>

      {/* Controls Overlay */}
      <View style={styles.overlay}>
        {/* Top Row:  Search Bar + Safety Button */}
        <View style={styles.topRow}>
          {/* Search/Destination Input */}
          <View style={[styles.searchContainer, { backgroundColor: cardBackground, borderColor }]}>
            <TextInput
              style={[styles.searchInput, { color: textColor }]}
              placeholder="Search destination..."
              placeholderTextColor={`${textColor}80`}
              value={destinationInput}
              onChangeText={setDestinationInput}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            {! destination ?  (
              <View style={styles.buttonGroup}>
                {destinationInput. trim().length >= 3 && (
                  <Pressable
                    style={[styles.iconButton, { backgroundColor: primaryColor }]}
                    onPress={handleSearch}
                    disabled={isSearching}
                  >
                    <ThemedText style={styles.iconButtonText}>
                      {isSearching ? '⏳' : '🔍'}
                    </ThemedText>
                  </Pressable>
                )}
                <Pressable
                  style={[styles.iconButton, { backgroundColor: primaryColor }]}
                  onPress={handleSelectOnMap}
                >
                  <ThemedText style={styles.iconButtonText}>🗺️</ThemedText>
                </Pressable>
              </View>
            ) : (
              <Pressable
                style={[styles.iconButton, { backgroundColor: '#F44336' }]}
                onPress={handleClearRoute}
              >
                <ThemedText style={styles. iconButtonText}>✕</ThemedText>
              </Pressable>
            )}
          </View>

          {/* Safety Reset Button */}
          <Pressable
            style={[styles. safetyButton, { backgroundColor:  '#FF5252' }]}
            onPress={handleSafetyReset}
          >
            <ThemedText style={styles.safetyButtonText}>🔄</ThemedText>
          </Pressable>
        </View>

        {/* Search Results */}
        {showResults && searchResults.length > 0 && (
          <View style={[styles.searchResults, { backgroundColor: cardBackground, borderColor }]}>
            <FlatList
              data={searchResults}
              keyExtractor={(item, index) => `${item.latitude}-${item.longitude}-${index}`}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.resultItem}
                  onPress={() => handleSelectSearchResult(item)}
                >
                  <ThemedText style={styles.resultIcon}>📍</ThemedText>
                  <View style={styles.resultTextContainer}>
                    <ThemedText style={styles.resultText} numberOfLines={2}>
                      {item.displayName}
                    </ThemedText>
                  </View>
                </Pressable>
              )}
              style={styles.resultsList}
              scrollEnabled={true}
              nestedScrollEnabled={true}
            />
          </View>
        )}

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

      {/* Loading indicator - centered overlay */}
      {isLoading && ! location && (
        <View style={styles.loadingOverlay}>
          <View style={[styles.loadingBox, { backgroundColor: cardBackground }]}>
            <ThemedText style={styles. loadingText}>
              📍 Getting your location...
            </ThemedText>
          </View>
        </View>
      )}

      {/* Current Location Info */}
      {location && (
        <View style={[styles.locationInfo, { backgroundColor: cardBackground, borderColor }]}>
          <ThemedText style={styles.locationText}>
            📍 {location.latitude. toFixed(6)}, {location.longitude.toFixed(6)}
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
    top: Platform.OS === 'ios' || Platform.OS === 'android' ? 60 : 20,
    left: 16,
    right: 16,
  },
  topRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center', // Centers items vertically
  },
  searchContainer: {
    flex: 1,
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
    minHeight: 60, // Ensures consistent height
    alignItems: 'center', // Centers content vertically
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingHorizontal: 8,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButtonText: {
    fontSize: 20,
  },
  searchButton: {
    paddingHorizontal: 20,
    paddingVertical:  10,
    borderRadius: 8,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  searchResults: {
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1,
    maxHeight: 250,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  resultsList: {
    maxHeight:  250,
  },
  resultItem: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  resultIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  resultTextContainer: {
    flex: 1,
  },
  resultText: {
    fontSize: 14,
  },
  routeInfo: {
    marginTop: 12,
  },
  routeStats: {
    flexDirection: 'row',
    gap: 12,
  },
  safetyButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems:  'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3.84,
    elevation: 5,
  },
  safetyButtonText: {
    fontSize: 24,
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
    flex:  1,
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
    paddingVertical:  12,
    borderRadius:  8,
  },
  buttonText: {
    color:  '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left:  0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingBox: {
    padding: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
  },
});