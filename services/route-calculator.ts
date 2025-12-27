/**
 * Route calculator service - calculates routes between points
 * Uses a simple straight-line calculation for now
 * In production, would integrate with Google Maps/Mapbox API
 */

import { LocationCoords } from './location';

export interface RoutePoint {
  lat: number;
  lng: number;
}

export interface Route {
  points: RoutePoint[];
  distance: number; // km
  estimatedTime: number; // minutes
}

class RouteCalculatorService {
  /**
   * Calculate route between two points
   * Currently returns a straight line - in production would use mapping API
   */
  async calculateRoute(
    start: LocationCoords,
    end: LocationCoords,
    avgSpeed: number = 15 // km/h
  ): Promise<Route> {
    try {
      // TODO: Integrate with actual routing API (Google Maps, Mapbox, etc.)
      
      // For now, create a simple straight line route
      const points: RoutePoint[] = [
        { lat: start.latitude, lng: start.longitude },
        { lat: end.latitude, lng: end.longitude },
      ];

      // Calculate distance using Haversine formula
      const distance = this.calculateDistance(start, end);
      
      // Estimate time based on average cycling speed
      const estimatedTime = (distance / avgSpeed) * 60; // minutes

      return {
        points,
        distance,
        estimatedTime,
      };
    } catch (error) {
      console.error('Failed to calculate route:', error);
      throw error;
    }
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  private calculateDistance(
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
    return R * c;
  }

  /**
   * Convert degrees to radians
   */
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Format distance for display
   */
  formatDistance(distance: number): string {
    if (distance < 1) {
      return `${Math.round(distance * 1000)} m`;
    }
    return `${distance.toFixed(1)} km`;
  }

  /**
   * Format time for display
   */
  formatTime(minutes: number): string {
    if (minutes < 60) {
      return `${Math.round(minutes)} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}min`;
  }
}

export const routeCalculator = new RouteCalculatorService();
