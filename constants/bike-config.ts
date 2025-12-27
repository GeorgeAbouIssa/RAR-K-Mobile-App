/**
 * E-Bike system configuration constants
 */

export const BikeConfig = {
  // Default settings
  defaultAssistanceMode: 'off' as const,
  maxSpeed: 25, // km/h (EU regulation)
  defaultRiderWeight: 70, // kg
  
  // Unit preferences
  speedUnit: 'km/h' as 'km/h' | 'mph',
  distanceUnit: 'km' as 'km' | 'mi',
  
  // Raspberry Pi connection
  raspberryPi: {
    // In production, this would be the actual IP/hostname
    hostname: 'raspberrypi.local',
    port: 8080,
    reconnectInterval: 5000, // ms
    timeout: 10000, // ms
  },
  
  // Weather API (using OpenWeatherMap as default)
  weather: {
    apiKey: 'demo', // Replace with actual API key
    apiUrl: 'https://api.openweathermap.org/data/2.5/weather',
    updateInterval: 600000, // 10 minutes
  },
  
  // Calorie calculation constants
  calories: {
    // MET values for different cycling intensities
    metLow: 4.0, // < 16 km/h
    metModerate: 6.8, // 16-19 km/h
    metHigh: 10.0, // 19-22 km/h
    metVeryHigh: 12.0, // > 22 km/h
    // Assistance factor (reduce calories when motor assists)
    assistanceFactor: 0.7,
  },
  
  // Ride tracking
  ride: {
    minDurationToSave: 60, // seconds (1 minute)
    locationUpdateInterval: 1000, // ms
    maxStoredRides: 100,
  },
  
  // Battery thresholds
  battery: {
    highThreshold: 50, // %
    lowThreshold: 20, // %
  },
};
