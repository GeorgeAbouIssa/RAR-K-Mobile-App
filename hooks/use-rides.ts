/**
 * Hook for managing ride history
 */

import { useEffect, useState } from 'react';
import { Ride } from '@/types/ride';
import { rideStorage } from '@/services/ride-storage';

export function useRides() {
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load rides on mount
  useEffect(() => {
    loadRides();
  }, []);

  const loadRides = async () => {
    try {
      setLoading(true);
      const loadedRides = await rideStorage.getAllRides();
      setRides(loadedRides);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const saveRide = async (ride: Ride) => {
    try {
      await rideStorage.saveRide(ride);
      await loadRides(); // Reload to get updated list
      setError(null);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const deleteRide = async (id: string) => {
    try {
      await rideStorage.deleteRide(id);
      await loadRides();
      setError(null);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const getRideById = async (id: string): Promise<Ride | null> => {
    try {
      return await rideStorage.getRideById(id);
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  };

  const getStatistics = async () => {
    try {
      return await rideStorage.getStatistics();
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  };

  return {
    rides,
    loading,
    error,
    saveRide,
    deleteRide,
    getRideById,
    getStatistics,
    refresh: loadRides,
  };
}
