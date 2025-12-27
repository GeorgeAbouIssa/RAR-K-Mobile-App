/**
 * Ride storage service - manages ride history in AsyncStorage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ride } from '@/types/ride';
import { BikeConfig } from '@/constants/bike-config';

const RIDES_STORAGE_KEY = '@rar_k:rides';

class RideStorageService {
  /**
   * Save a new ride
   */
  async saveRide(ride: Ride): Promise<void> {
    try {
      const rides = await this.getAllRides();
      rides.unshift(ride); // Add to beginning (most recent first)

      // Limit stored rides
      if (rides.length > BikeConfig.ride.maxStoredRides) {
        rides.splice(BikeConfig.ride.maxStoredRides);
      }

      await AsyncStorage.setItem(RIDES_STORAGE_KEY, JSON.stringify(rides));
    } catch (error) {
      console.error('Failed to save ride:', error);
      throw error;
    }
  }

  /**
   * Get all rides
   */
  async getAllRides(): Promise<Ride[]> {
    try {
      const ridesJson = await AsyncStorage.getItem(RIDES_STORAGE_KEY);
      if (!ridesJson) {
        return [];
      }

      const rides = JSON.parse(ridesJson);
      // Convert date strings back to Date objects
      return rides.map((ride: any) => ({
        ...ride,
        startTime: new Date(ride.startTime),
        endTime: new Date(ride.endTime),
      }));
    } catch (error) {
      console.error('Failed to get rides:', error);
      return [];
    }
  }

  /**
   * Get a specific ride by ID
   */
  async getRideById(id: string): Promise<Ride | null> {
    try {
      const rides = await this.getAllRides();
      return rides.find((ride) => ride.id === id) || null;
    } catch (error) {
      console.error('Failed to get ride:', error);
      return null;
    }
  }

  /**
   * Delete a ride
   */
  async deleteRide(id: string): Promise<void> {
    try {
      const rides = await this.getAllRides();
      const filteredRides = rides.filter((ride) => ride.id !== id);
      await AsyncStorage.setItem(RIDES_STORAGE_KEY, JSON.stringify(filteredRides));
    } catch (error) {
      console.error('Failed to delete ride:', error);
      throw error;
    }
  }

  /**
   * Clear all rides
   */
  async clearAllRides(): Promise<void> {
    try {
      await AsyncStorage.removeItem(RIDES_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear rides:', error);
      throw error;
    }
  }

  /**
   * Get aggregate statistics
   */
  async getStatistics(): Promise<{
    totalRides: number;
    totalDistance: number;
    totalDuration: number;
    avgSpeed: number;
    totalCalories: number;
  }> {
    try {
      const rides = await this.getAllRides();
      
      if (rides.length === 0) {
        return {
          totalRides: 0,
          totalDistance: 0,
          totalDuration: 0,
          avgSpeed: 0,
          totalCalories: 0,
        };
      }

      const totalDistance = rides.reduce((sum, ride) => sum + ride.distance, 0);
      const totalDuration = rides.reduce(
        (sum, ride) =>
          sum + (ride.endTime.getTime() - ride.startTime.getTime()) / 1000,
        0
      );
      const totalCalories = rides.reduce((sum, ride) => sum + ride.caloriesBurnt, 0);
      const avgSpeed = totalDuration > 0 ? (totalDistance / (totalDuration / 3600)) : 0;

      return {
        totalRides: rides.length,
        totalDistance,
        totalDuration,
        avgSpeed,
        totalCalories,
      };
    } catch (error) {
      console.error('Failed to get statistics:', error);
      throw error;
    }
  }
}

export const rideStorage = new RideStorageService();
