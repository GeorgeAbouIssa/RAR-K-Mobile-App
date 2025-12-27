import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, View, Platform } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Speedometer } from '@/components/speedometer';
import { BatteryIndicator } from '@/components/battery-indicator';
import { AssistanceModeSelector } from '@/components/assistance-mode-selector';
import { StatCard } from '@/components/stat-card';
import { useBikeData } from '@/hooks/use-bike-data';
import { useLocation } from '@/hooks/use-location';
import { weatherService } from '@/services/weather-api';
import { bikeConnection } from '@/services/bike-connection';

export default function DashboardScreen() {
  const { bikeData, isConnected, setAssistanceMode } = useBikeData();
  const { location } = useLocation();
  const [temperature, setTemperature] = useState<number | undefined>();

  // Fetch weather data
  useEffect(() => {
    if (location) {
      weatherService
        .getWeather(location.latitude, location.longitude)
        .then((data) => {
          if (data) {
            setTemperature(data.temperature);
            bikeConnection.setTemperature(data.temperature);
          }
        })
        .catch((err) => console.error('Weather fetch error:', err));
    }
  }, [location]);

  const formatTime = () => {
    return new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <ThemedText type="title">E-Bike Dashboard</ThemedText>
          <ThemedText style={styles.time}>{formatTime()}</ThemedText>
        </View>

        {/* Connection status */}
        {!isConnected && (
          <ThemedView style={styles.statusBanner}>
            <ThemedText style={styles.statusText}>
              ⚠️ Connecting to bike...
            </ThemedText>
          </ThemedView>
        )}

        {/* Main Speedometer */}
        <Speedometer speed={bikeData.speed} />

        {/* Battery indicator */}
        <View style={styles.batterySection}>
          <ThemedText style={styles.sectionTitle}>Battery/Supercapacitor</ThemedText>
          <BatteryIndicator level={bikeData.batteryLevel} />
        </View>

        {/* Assistance Mode Selector */}
        <AssistanceModeSelector
          mode={bikeData.assistanceMode}
          onModeChange={setAssistanceMode}
        />

        {/* Metrics Grid */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricsRow}>
            <StatCard label="Power" value={Math.round(bikeData.power)} unit="W" icon="⚡" />
            <StatCard 
              label="Cadence" 
              value={Math.round(bikeData.cadence)} 
              unit="RPM" 
              icon="🔄" 
            />
          </View>
          <View style={styles.metricsRow}>
            <StatCard 
              label="Torque" 
              value={bikeData.torque.toFixed(1)} 
              unit="Nm" 
              icon="💪" 
            />
            {temperature !== undefined && (
              <StatCard 
                label="Weather" 
                value={temperature} 
                unit="°C" 
                icon="🌡️" 
              />
            )}
          </View>
        </View>

        {/* Motor Status */}
        <View style={styles.statusSection}>
          <ThemedText style={styles.motorStatus}>
            Motor: {bikeData.motorActive ? '🟢 Active' : '⚫ Inactive'}
          </ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 16,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  time: {
    fontSize: 16,
    marginTop: 8,
    opacity: 0.7,
  },
  statusBanner: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  batterySection: {
    alignItems: 'center',
    marginVertical: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    opacity: 0.7,
  },
  metricsGrid: {
    marginTop: 24,
    gap: 12,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statusSection: {
    marginTop: 24,
    marginBottom: 40,
    alignItems: 'center',
  },
  motorStatus: {
    fontSize: 16,
    fontWeight: '600',
  },
});

