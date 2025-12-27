/**
 * Weather API service
 */

import axios from 'axios';
import { BikeConfig } from '@/constants/bike-config';

interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
}

class WeatherService {
  private cachedData: WeatherData | null = null;
  private lastFetch: number = 0;

  /**
   * Fetch weather data based on GPS coordinates
   */
  async getWeather(lat: number, lon: number): Promise<WeatherData | null> {
    const now = Date.now();
    
    // Return cached data if still valid
    if (this.cachedData && now - this.lastFetch < BikeConfig.weather.updateInterval) {
      return this.cachedData;
    }

    try {
      // Using OpenWeatherMap API
      const response = await axios.get(BikeConfig.weather.apiUrl, {
        params: {
          lat,
          lon,
          appid: BikeConfig.weather.apiKey,
          units: 'metric', // Celsius
        },
        timeout: 5000,
      });

      const data: WeatherData = {
        temperature: Math.round(response.data.main.temp),
        condition: response.data.weather[0].main,
        humidity: response.data.main.humidity,
        windSpeed: response.data.wind.speed,
      };

      this.cachedData = data;
      this.lastFetch = now;
      return data;
    } catch (error) {
      console.error('Failed to fetch weather:', error);
      
      // Return mock data for development if API fails
      if (BikeConfig.weather.apiKey === 'demo') {
        const mockData: WeatherData = {
          temperature: 22,
          condition: 'Clear',
          humidity: 65,
          windSpeed: 3.5,
        };
        this.cachedData = mockData;
        this.lastFetch = now;
        return mockData;
      }
      
      return null;
    }
  }

  /**
   * Clear cached weather data
   */
  clearCache(): void {
    this.cachedData = null;
    this.lastFetch = 0;
  }
}

export const weatherService = new WeatherService();
