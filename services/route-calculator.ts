/**
 * Route calculator service - calculates routes between points
 * Uses OpenRouteService API for real road routing
 */

import { LocationCoords } from './location';

export interface RoutePoint {
  lat: number;
  lng: number;
}

export interface Route {
  points:  RoutePoint[];
  distance:  number; // km
  estimatedTime:  number; // minutes
}

class RouteCalculatorService {
  // Free API key - replace with your own from https://openrouteservice.org/dev/#/signup
  private readonly API_KEY = '5b3ce3597851100001cf62e4ae8a6b2289df4952be3727869762b67ebb';
  private readonly BASE_URL = 'https://api.openrouteservice.org/v2/directions';

  /**
   * Calculate route between two points using OpenRouteService
   * Profile: cycling-regular (for e-bikes)
   */
  async calculateRoute(
    start: LocationCoords,
    end: LocationCoords,
    avgSpeed: number = 15 // km/h - fallback for manual calculation
  ): Promise<Route> {
    try {
      // Try using OpenRouteService API for real routing
      const route = await this.fetchRouteFromAPI(start, end);
      if (route) {
        return route;
      }

      // Fallback to straight line if API fails
      console.warn('Using fallback straight-line route');
      return this.calculateStraightLineRoute(start, end, avgSpeed);
    } catch (error) {
      console.error('Failed to calculate route:', error);
      // Fallback to straight line
      return this.calculateStraightLineRoute(start, end, avgSpeed);
    }
  }

  /**
   * Fetch route from OpenRouteService API
   */
  private async fetchRouteFromAPI(
    start: LocationCoords,
    end: LocationCoords
  ): Promise<Route | null> {
    try {
      const url = `${this.BASE_URL}/cycling-regular/geojson`;
      
      const body = {
        coordinates: [
          [start.longitude, start.latitude], // [lng, lat] format
          [end.longitude, end.latitude],
        ],
      };

      console.log('Requesting route from:', start, 'to:', end);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'application/json, application/geo+json',
          'Authorization': this.API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API response not OK:', response.status, errorText);
        return null;
      }

      const data = await response.json();
      console.log('Route API response:', JSON.stringify(data).substring(0, 200));

      // Check if we have features (GeoJSON format)
      if (!data.features || data.features. length === 0) {
        console.error('No features in response');
        return null;
      }

      const feature = data.features[0];
      
      // Check geometry exists
      if (!feature.geometry || !feature.geometry.coordinates) {
        console.error('No geometry coordinates in response');
        return null;
      }

      // Check properties exist
      if (!feature.properties || !feature.properties.summary) {
        console.error('No properties/summary in response');
        return null;
      }

      // Convert coordinates to RoutePoint format
      const points:  RoutePoint[] = feature.geometry.coordinates.map(
        (coord: [number, number]) => ({
          lng: coord[0],
          lat: coord[1],
        })
      );

      // Distance in km (API returns meters, convert to km)
      const distance = feature.properties.summary.distance / 1000;
      
      // Time in minutes (API returns seconds)
      const estimatedTime = feature.properties.summary.duration / 60;

      console.log(`Route calculated:  ${distance.toFixed(2)}km, ${estimatedTime.toFixed(0)}min`);

      return {
        points,
        distance,
        estimatedTime,
      };
    } catch (error) {
      console.error('Error fetching route from API:', error);
      return null;
    }
  }

  /**
   * Fallback: Calculate straight-line route
   */
  private calculateStraightLineRoute(
    start: LocationCoords,
    end: LocationCoords,
    avgSpeed: number
  ): Route {
    const points: RoutePoint[] = [
      { lat: start.latitude, lng: start.longitude },
      { lat: end.latitude, lng: end.longitude },
    ];

    const distance = this. calculateDistance(start, end);
    const estimatedTime = (distance / avgSpeed) * 60;

    console.log(`Fallback route: ${distance.toFixed(2)}km, ${estimatedTime.toFixed(0)}min`);

    return {
      points,
      distance,
      estimatedTime,
    };
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
      Math.cos(this. toRadians(coord1.latitude)) *
        Math.cos(this.toRadians(coord2.latitude)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math. sqrt(a), Math.sqrt(1 - a));
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
    const mins = Math. round(minutes % 60);
    return `${hours}h ${mins}min`;
  }
}

export const routeCalculator = new RouteCalculatorService();