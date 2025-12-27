/**
 * Location service - handles GPS tracking
 */

import * as Location from 'expo-location';

export interface LocationCoords {
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy?: number;
}

class LocationService {
  private watchId: Location.LocationSubscription | null = null;

  /**
   * Request location permissions
   */
  async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Failed to request location permissions:', error);
      return false;
    }
  }

  /**
   * Get current location
   */
  async getCurrentLocation(): Promise<LocationCoords | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        altitude: location.coords.altitude ?? undefined,
        accuracy: location.coords.accuracy ?? undefined,
      };
    } catch (error) {
      console.error('Failed to get location:', error);
      return null;
    }
  }

  /**
   * Start watching location changes
   */
  async startTracking(
    callback: (coords: LocationCoords) => void,
    interval: number = 1000
  ): Promise<boolean> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        return false;
      }

      this.watchId = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: interval,
          distanceInterval: 5, // Update every 5 meters
        },
        (location) => {
          callback({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            altitude: location.coords.altitude ?? undefined,
            accuracy: location.coords.accuracy ?? undefined,
          });
        }
      );

      return true;
    } catch (error) {
      console.error('Failed to start location tracking:', error);
      return false;
    }
  }

  /**
   * Stop watching location changes
   */
  stopTracking(): void {
    if (this.watchId) {
      this.watchId.remove();
      this.watchId = null;
    }
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  calculateDistance(
    coord1: LocationCoords,
    coord2: LocationCoords
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRadians(coord2.latitude - coord1.latitude);
    const dLon = this.toRadians(coord2.longitude - coord1.longitude);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(coord1.latitude)) *
        Math.cos(this.toRadians(coord2.latitude)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  }

  /**
   * Convert degrees to radians
   */
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}

export const locationService = new LocationService();
