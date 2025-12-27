# RAR_K - E-Bike System Mobile Application 🚴‍♂️⚡

A comprehensive React Native/Expo mobile application for controlling and monitoring a Raspberry Pi-based e-bike conversion system. This app provides real-time bike metrics, ride tracking, and navigation features.

## Features

### 📊 Dashboard
- **Real-time speedometer** - Large circular gauge displaying current speed
- **Battery/Supercapacitor indicator** - Visual charge level with color-coded states
- **Assistance mode selector** - Toggle between OFF, Automatic, and Hill Climb modes
- **Live metrics** - Power output, cadence, torque, and weather information
- **Motor status** - Real-time indication of motor activity

### 🚴 Ride History
- **Ride tracking** - Automatic recording of ride sessions
- **Statistics dashboard** - Overall stats including total distance, time, and calories
- **Ride list** - Detailed cards for each past ride
- **Metrics per ride**:
  - Average and max speed
  - Total distance and duration
  - Assistance time
  - Energy recovered
  - Calories burned

### 🗺️ Navigation
- **GPS tracking** - Real-time location monitoring
- **Route planning** - Set destinations and calculate routes
- **Map visualization** - Interactive map with current location and route display
- **Distance and ETA** - Estimated time and distance to destination

## Tech Stack

- **React Native** with **Expo** framework
- **TypeScript** for type safety
- **React Navigation** for tab navigation
- **Expo Location** for GPS tracking
- **React Native Maps** for map visualization
- **AsyncStorage** for local data persistence
- **Axios** for API calls

## Project Structure

```
RAR_K/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx           # Dashboard screen
│   │   ├── ride-info.tsx       # Ride history screen
│   │   ├── navigation.tsx      # Map & navigation screen
│   │   └── _layout.tsx         # Tab navigation layout
│   └── _layout.tsx             # Root layout with providers
├── components/
│   ├── speedometer.tsx         # Circular speed gauge
│   ├── battery-indicator.tsx  # Battery charge display
│   ├── assistance-mode-selector.tsx  # Mode toggle
│   ├── stat-card.tsx           # Reusable metric card
│   ├── ride-history-card.tsx  # Ride summary card
│   └── map-view.tsx            # Map wrapper
├── services/
│   ├── bike-connection.ts      # Raspberry Pi communication
│   ├── weather-api.ts          # Weather data fetching
│   ├── location.ts             # GPS location services
│   ├── ride-storage.ts         # Ride data persistence
│   ├── calories-calculator.ts  # Calorie burn calculation
│   └── route-calculator.ts     # Route planning
├── context/
│   └── bike-context.tsx        # Global state management
├── hooks/
│   ├── use-bike-data.ts        # Real-time bike data hook
│   ├── use-rides.ts            # Ride history management
│   └── use-location.ts         # Location tracking hook
├── types/
│   ├── bike-data.ts            # Bike data interfaces
│   └── ride.ts                 # Ride data interface
└── constants/
    ├── theme.ts                # Color themes and styles
    └── bike-config.ts          # App configuration
```

## Get Started

### Prerequisites
- Node.js 18+ and npm
- Expo CLI
- iOS Simulator (Mac) or Android Emulator

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npx expo start
   ```

3. Run on your platform:
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on your phone

## Development

### Mock Data
The app currently uses mock data for the Raspberry Pi connection, allowing you to test the UI without hardware. Real-time cycling data is simulated with realistic values.

### Linting
```bash
npm run lint
```

### Type Checking
```bash
npx tsc --noEmit
```

## Configuration

### Weather API
To use real weather data, update `constants/bike-config.ts`:
```typescript
weather: {
  apiKey: 'YOUR_OPENWEATHERMAP_API_KEY',
  // ...
}
```

### Raspberry Pi Connection
Update the connection settings in `constants/bike-config.ts`:
```typescript
raspberryPi: {
  hostname: 'your-raspberry-pi.local',
  port: 8080,
  // ...
}
```

## Features in Detail

### Assistance Modes
- **OFF** - No motor assistance, manual pedaling only
- **Automatic** - Motor assists based on pedaling effort
- **Hill Climb** - Maximum motor assistance for steep inclines

### Battery Management
Color-coded battery indicator:
- 🟢 Green (>50%) - Good charge
- 🟡 Yellow (20-50%) - Medium charge
- 🔴 Red (<20%) - Low charge, recharge soon

### Calorie Calculation
Uses MET (Metabolic Equivalent) values based on:
- Cycling speed
- Cadence (pedal RPM)
- Rider weight
- Assistance level (reduces when motor is active)

## Learn More

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [React Navigation](https://reactnavigation.org/)

## License

This project is part of the RAR_K system.
