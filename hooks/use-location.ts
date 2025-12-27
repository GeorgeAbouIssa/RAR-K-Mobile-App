/**
 * Hook for location tracking
 */

import { useEffect, useState, useRef } from 'react';
import { locationService, LocationCoords } from '@/services/location';

export function useLocation() {
  const [location, setLocation] = useState<LocationCoords | null>(null);
  const [tracking, setTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryCountRef = useRef(0);
  const maxRetries = 5;

  // Request permissions on mount
  useEffect(() => {
    requestPermission();
  }, []);

  const requestPermission = async (): Promise<boolean> => {
    try {
      const granted = await locationService.requestPermissions();
      setHasPermission(granted);
      if (! granted) {
        setError('Location permission denied');
      }
      return granted;
    } catch (err:  any) {
      setError(err.message);
      return false;
    }
  };

  const getCurrentLocation = async (): Promise<LocationCoords | null> => {
    try {
      setIsLoading(true);
      const coords = await locationService.getCurrentLocation();
      if (coords) {
        setLocation(coords);
        setError(null);
        retryCountRef.current = 0; // Reset retry count on success
        setIsLoading(false);
        return coords;
      }
      setIsLoading(false);
      return null;
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
      return null;
    }
  };

  const getCurrentLocationWithRetry = async (): Promise<LocationCoords | null> => {
    // Clear any existing retry timeout
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }

    const coords = await getCurrentLocation();
    
    if (! coords && retryCountRef.current < maxRetries) {
      retryCountRef.current += 1;
      const delay = Math.min(1000 * retryCountRef.current, 5000); // Exponential backoff, max 5s
      
      console.log(`Location retry ${retryCountRef.current}/${maxRetries} in ${delay}ms`);
      
      retryTimeoutRef.current = setTimeout(() => {
        getCurrentLocationWithRetry();
      }, delay);
    } else if (retryCountRef.current >= maxRetries) {
      setError('Failed to get location after multiple attempts');
    }
    
    return coords;
  };

  const startTracking = async (interval: number = 1000) => {
    try {
      const success = await locationService.startTracking((coords) => {
        setLocation(coords);
        setError(null);
        retryCountRef.current = 0;
      }, interval);
      
      setTracking(success);
      if (! success) {
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
      if (retryTimeoutRef. current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [tracking]);

  return {
    location,
    tracking,
    error,
    hasPermission,
    isLoading,
    getCurrentLocation,
    getCurrentLocationWithRetry,
    startTracking,
    stopTracking,
    requestPermission,
  };
}