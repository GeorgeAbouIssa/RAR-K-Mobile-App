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
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const results = await geocodingService.searchAddress(destinationInput);
      setSearchResults(results);
      setShowResults(results.length > 0);

      if (results.length === 0) {
        Alert.alert('No Results', 'No locations found for your search');
      }
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Search Error', 'Failed to search for location');
    } finally {
      setIsSearching(false);
    }
  };

  // Auto-search as user types (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (destinationInput.trim().length >= 3 && !destination && !isSelectingOnMap) {
        handleSearch();
      } else if (destinationInput.trim().length < 3) {
        setShowResults(false);
        setSearchResults([]);
      }
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(timer);
  }, [destinationInput]);

  const calculateRouteToDestination = async (dest: LocationCoords) => {
    if (!location) {
      Alert.alert('Location Error', 'Current location not available');
      return;
    }

    try {
      const calculatedRoute = await routeCalculator.  calculateRoute(location, dest);
      setRoute(calculatedRoute);
    } catch (error) {
      console.error('Route calculation error:', error);
      Alert.alert('Route Error', 'Failed to calculate route');
    }
  };

  const setDestinationAndCalculateRoute = async (coordinate: LocationCoords) => {
    setDestination(coordinate);
    setIsSelectingOnMap(false);
    setShowResults(false);
    Keyboard.dismiss();
    
    // Reverse geocode to get address
    const address = await geocodingService.reverseGeocode(coordinate);
    if (address) {
      setDestinationInput(address);
    }
    
    await calculateRouteToDestination(coordinate);
  };

  const handleMapPress = async (coordinate: LocationCoords) => {
    // Only respond to regular tap if in selection mode
    if (!  isSelectingOnMap) return;
    
    await setDestinationAndCalculateRoute(coordinate);
  };

  const handleMapLongPress = async (coordinate: LocationCoords) => {
    // Long press works anytime, even if not in selection mode
    await setDestinationAndCalculateRoute(coordinate);
  };

  const handleSelectSearchResult = async (result: GeocodeResult) => {
    const dest:   LocationCoords = {
      latitude:  result.latitude,
      longitude: result.longitude,
    };
    
    setDestination(dest);
    setDestinationInput(result.displayName);
    setShowResults(false);
    setSearchResults([]);
    Keyboard.dismiss();
    
    await calculateRouteToDestination(dest);
  };

  const handleSelectOnMap = () => {
    setIsSelectingOnMap(true);
    setDestination(null);
    setRoute(null);
    setShowResults(false);
    setSearchResults([]);
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

  if (!  hasPermission) {
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
          route={route?.points}
          showUserLocation={true}
          onMapPress={handleMapPress}
          onMapLongPress={handleMapLongPress}
          isSelectingDestination={isSelectingOnMap}
        />
      </View>

      {/* Top Controls Overlay */}
      <View style={styles.overlay}>
        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: cardBackground, borderColor }]}>
          <TextInput
            style={[styles.searchInput, { color: textColor }]}
            placeholder="Search destination..."
            placeholderTextColor={`${textColor}80`}
            value={destinationInput}
            onChangeText={setDestinationInput}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            autoCorrect={false}
            autoCapitalize="none"
          />
          {!  destination ?   (
            <View style={styles.buttonGroup}>
              {destinationInput.  trim().length >= 3 && (
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
              <ThemedText style={styles.  iconButtonText}>✕</ThemedText>
            </Pressable>
          )}
        </View>

        {/* Search Results Dropdown - ONLY show when NOT selecting on map */}
        {showResults && searchResults.length > 0 && !  isSelectingOnMap && (
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
              keyboardShouldPersistTaps="handled"
            />
          </View>
        )}

        {/* Selecting on map hint */}
        {isSelectingOnMap && (
          <View style={[styles.hintBanner, { backgroundColor: primaryColor }]}>
            <ThemedText style={styles.hintText}>
              📍 Tap anywhere on the map to set destination
            </ThemedText>
          </View>
        )}
      </View>

      {/* Bottom Ride Info Panel (Google Maps style) */}
      {route && destination && (
        <View style={[styles.bottomPanel, { backgroundColor: cardBackground, borderColor }]}>
          <View style={styles.panelHeader}>
            <View style={styles.panelDestination}>
              <View style={styles.panelIconContainer}>
                <ThemedText style={styles.panelIcon}>📍</ThemedText>
              </View>
              <View style={styles.panelDestinationText}>
                <ThemedText style={styles.panelLabel}>Destination</ThemedText>
                <ThemedText style={styles.  panelAddress} numberOfLines={1}>
                  {destinationInput || 'Selected Location'}
                </ThemedText>
              </View>
            </View>
            <Pressable
              style={[styles.closeButton, { backgroundColor: '#F44336' }]}
              onPress={handleClearRoute}
            >
              <ThemedText style={styles.closeButtonText}>✕</ThemedText>
            </Pressable>
          </View>
          
          <View style={styles.panelStats}>
            <View style={styles.panelStatItem}>
              <View style={styles.panelStatIconContainer}>
                <ThemedText style={styles.panelStatIcon}>📏</ThemedText>
              </View>
              <View>
                <ThemedText style={styles.panelStatLabel}>Distance</ThemedText>
                <ThemedText style={styles.panelStatValue}>
                  {routeCalculator.formatDistance(route.distance)}
                </ThemedText>
              </View>
            </View>
            
            <View style={styles.panelDivider} />
            
            <View style={styles.panelStatItem}>
              <View style={styles. panelStatIconContainer}>
                <ThemedText style={styles. panelStatIcon}>⏱️</ThemedText>
              </View>
              <View>
                <ThemedText style={styles.panelStatLabel}>Est. Time</ThemedText>
                <ThemedText style={styles.panelStatValue}>
                  {routeCalculator.formatTime(route.estimatedTime)}
                </ThemedText>
              </View>
            </View>
          </View>

          <Pressable
            style={[styles.startButton, { backgroundColor: primaryColor }]}
            onPress={() => Alert.alert('Start Navigation', 'Navigation feature coming soon!')}
          >
            <ThemedText style={styles.startButtonText}>Start Navigation</ThemedText>
          </Pressable>
        </View>
      )}

      {/* Loading indicator - centered overlay */}
      {isLoading && !  location && (
        <View style={styles.loadingOverlay}>
          <View style={[styles.loadingBox, { backgroundColor: cardBackground }]}>
            <ThemedText style={styles.loadingText}>
              📍 Getting your location...
            </ThemedText>
          </View>
        </View>
      )}

      {/* Current Location Info - Only show when NO route is active */}
      {location && ! route && (
        <View style={[styles.locationInfo, { backgroundColor: cardBackground, borderColor }]}>
          <ThemedText style={styles.locationText}>
            📍 {location.latitude.  toFixed(6)}, {location.longitude. toFixed(6)}
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
    zIndex: 10,
  },
  searchContainer: {
    flexDirection:  'row',
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingHorizontal: 8,
    paddingVertical:   4,
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
    alignItems:   'center',
  },
  iconButtonText: {
    fontSize: 20,
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
    overflow: 'hidden',
  },
  resultsList: {
    maxHeight: 250,
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
  hintBanner:   {
    marginTop: 8,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  hintText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  bottomPanel: {
    position: 'absolute',
    bottom: 0,
    left:   0,
    right: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ?   34 : 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity:   0.3,
    shadowRadius: 5,
    elevation: 10,
    zIndex: 5,
    overflow: 'visible',
  },
  panelHeader: {
    flexDirection:   'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    overflow: 'visible',
  },
  panelDestination: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
    overflow: 'visible',
  },
  panelIconContainer: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    overflow: 'visible',
  },
  panelIcon: {
    fontSize: 26,
    lineHeight: 32,
    textAlign: 'center',
  },
  panelDestinationText: {
    flex: 1,
  },
  panelLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 2,
  },
  panelAddress: {
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems:   'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize:   18,
    fontWeight: 'bold',
  },
  panelStats: {
    flexDirection:   'row',
    marginBottom: 16,
    paddingVertical: 12,
    overflow: 'visible',
  },
  panelStatItem:   {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    overflow: 'visible',
  },
  panelStatIconContainer:  {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'visible',
  },
  panelStatIcon:   {
    fontSize: 22,
    lineHeight: 28,
    textAlign: 'center',
  },
  panelStatLabel:   {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 2,
  },
  panelStatValue:   {
    fontSize: 18,
    fontWeight: '700',
  },
  panelDivider: {
    width: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginHorizontal: 16,
  },
  startButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
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
    zIndex: 1,
  },
  locationText: {
    fontSize: 12,
    fontWeight: '500',
  },
  permissionContainer: {
    flex:   1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionText: {
    fontSize:  18,
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical:   12,
    borderRadius:   8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor:   'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems:  'center',
    zIndex: 20,
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
  loadingText:   {
    fontSize: 16,
    fontWeight: '600',
  },
});