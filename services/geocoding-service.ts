/**
 * Geocoding service - Convert addresses to coordinates and vice versa
 * Uses OpenStreetMap Nominatim API (free, no API key required)
 */

import { LocationCoords } from './location';

export interface GeocodeResult {
  address: string;
  latitude: number;
  longitude: number;
  displayName:  string;
}

class GeocodingService {
  private readonly BASE_URL = 'https://nominatim.openstreetmap.org';
  private requestCache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private lastRequestTime = 0;
  private readonly MIN_REQUEST_INTERVAL = 1000; // 1 second between requests (Nominatim requirement)

  /**
   * Delay to respect Nominatim rate limiting
   */
  private async respectRateLimit() {
    const now = Date. now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.MIN_REQUEST_INTERVAL) {
      await new Promise(resolve => setTimeout(resolve, this. MIN_REQUEST_INTERVAL - timeSinceLastRequest));
    }
    this.lastRequestTime = Date.now();
  }

  /**
   * Search for address and convert to coordinates
   */
  async searchAddress(query: string): Promise<GeocodeResult[]> {
    try {
      if (!query || query.trim().length < 3) {
        return [];
      }

      // Check cache first
      const cacheKey = `search_${query.toLowerCase()}`;
      const cached = this.requestCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
        console.log('Using cached geocoding result');
        return cached.data;
      }

      // Respect rate limiting
      await this. respectRateLimit();

      const params = new URLSearchParams({
        q: query,
        format:  'json',
        limit:  '5',
        addressdetails: '1'
      });

      const url = `${this.BASE_URL}/search?${params. toString()}`;

      console.log('Geocoding request:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'RAR-Kit-Mobile-App',
          'Accept-Language': 'en',
        },
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Geocoding API error:', response.status, errorText);
        return [];
      }

      const data = await response. json();
      console.log('Geocoding data received:', data. length, 'results');

      if (! Array.isArray(data) || data.length === 0) {
        return [];
      }

      const results = data.map((item: any) => ({
        address: item.address?. road || item.address?.city || item.address?.town || query,
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
        displayName: item.display_name,
      }));

      // Cache the results
      this.requestCache.set(cacheKey, { data:  results, timestamp: Date.now() });

      console.log(`Found ${results.length} geocoding results`);

      return results;
    } catch (error: any) {
      console.error('Geocoding error:', error);
      return [];
    }
  }

  /**
   * Reverse geocode - convert coordinates to address
   */
  async reverseGeocode(coords: LocationCoords): Promise<string | null> {
    try {
      // Check cache first
      const cacheKey = `reverse_${coords.latitude.toFixed(4)}_${coords.longitude.toFixed(4)}`;
      const cached = this.requestCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
        console.log('Using cached reverse geocoding result');
        return cached.data;
      }

      // Respect rate limiting
      await this. respectRateLimit();

      const params = new URLSearchParams({
        lat: coords.latitude.toString(),
        lon: coords.longitude.toString(),
        format: 'json'
      });

      const url = `${this.BASE_URL}/reverse?${params.toString()}`;

      console.log('Reverse geocoding request:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'RAR-Kit-Mobile-App',
          'Accept-Language': 'en',
        },
      });

      if (!response.ok) {
        console.error('Reverse geocoding API error:', response.status);
        return null;
      }

      const data = await response.json();
      const result = data.display_name || null;

      // Cache the result
      if (result) {
        this.requestCache.set(cacheKey, { data: result, timestamp:  Date.now() });
      }

      console.log('Reverse geocode result:', result);

      return result;
    } catch (error: any) {
      console.error('Reverse geocoding error:', error);
      return null;
    }
  }

  /**
   * Clear the cache
   */
  clearCache() {
    this.requestCache.clear();
  }
}

export const geocodingService = new GeocodingService();