/**
 * Hook for location tracking
 */

import { useEffect, useState } from 'react';
import { locationService, LocationCoords } from '@/services/location';

export function useLocation() {
  const [location, setLocation] = useState<LocationCoords | null>(null);
  const [tracking, setTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(false);

  // Request permissions on mount
  useEffect(() => {
    requestPermission();
  }, []);

  const requestPermission = async () => {
    try {
      const granted = await locationService.requestPermissions();
      setHasPermission(granted);
      if (!granted) {
        setError('Location permission denied');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const getCurrentLocation = async (): Promise<LocationCoords | null> => {
    try {
      const coords = await locationService.getCurrentLocation();
      if (coords) {
        setLocation(coords);
        setError(null);
      }
      return coords;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  };

  const startTracking = async (interval: number = 1000) => {
    try {
      const success = await locationService.startTracking((coords) => {
        setLocation(coords);
        setError(null);
      }, interval);
      
      setTracking(success);
      if (!success) {
        setError('Failed to start location tracking');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const stopTracking = () => {
    locationService.stopTracking();
    setTracking(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (tracking) {
        stopTracking();
      }
    };
  }, [tracking]);

  return {
    location,
    tracking,
    error,
    hasPermission,
    getCurrentLocation,
    startTracking,
    stopTracking,
    requestPermission,
  };
}
