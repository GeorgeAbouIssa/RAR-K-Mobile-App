/**
 * Geocoding service - Convert addresses to coordinates and vice versa
 * Uses OpenStreetMap Nominatim API (free, no API key required)
 */

import { LocationCoords } from './location';

export interface GeocodeResult {
  address: string;
  latitude: number;
  longitude: number;
  displayName: string;
}

class GeocodingService {
  private readonly BASE_URL = 'https://nominatim.openstreetmap. org';

  /**
   * Search for address and convert to coordinates
   */
  async searchAddress(query: string): Promise<GeocodeResult[]> {
    try {
      if (!query || query.trim().length < 3) {
        return [];
      }

      const url = `${this.BASE_URL}/search? q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1`;

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'RAR-Kit-EBike-App', // Required by Nominatim
        },
      });

      if (!response. ok) {
        console.error('Geocoding API error:', response.status);
        return [];
      }

      const data = await response.json();

      return data.map((item: any) => ({
        address: item. address?. road || item.address?.city || query,
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
        displayName: item.display_name,
      }));
    } catch (error) {
      console.error('Geocoding error:', error);
      return [];
    }
  }

  /**
   * Reverse geocode - convert coordinates to address
   */
  async reverseGeocode(coords: LocationCoords): Promise<string | null> {
    try {
      const url = `${this.BASE_URL}/reverse?lat=${coords.latitude}&lon=${coords.longitude}&format=json`;

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'RAR-Kit-EBike-App',
        },
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data.display_name || null;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return null;
    }
  }
}

export const geocodingService = new GeocodingService();