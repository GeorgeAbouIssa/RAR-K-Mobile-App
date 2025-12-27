/**
 * Ride history card component - Card for displaying individual ride summaries
 */

import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Ride } from '@/types/ride';

interface RideHistoryCardProps {
  ride: Ride;
  onPress?: () => void;
}

export function RideHistoryCard({ ride, onPress }: RideHistoryCardProps) {
  const cardBackground = useThemeColor({}, 'cardBackground' as any);
  const borderColor = useThemeColor({}, 'border' as any);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const duration = Math.floor((ride.endTime.getTime() - ride.startTime.getTime()) / 1000);

  return (
    <Pressable onPress={onPress} disabled={!onPress}>
      {({ pressed }) => (
        <ThemedView
          style={[
            styles.container,
            {
              backgroundColor: cardBackground,
              borderColor: borderColor,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          {/* Date header */}
          <View style={styles.header}>
            <ThemedText style={styles.date}>{formatDate(ride.startTime)}</ThemedText>
            <ThemedText style={styles.duration}>{formatDuration(duration)}</ThemedText>
          </View>

          {/* Main stats */}
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <ThemedText style={styles.statLabel}>Distance</ThemedText>
              <ThemedText style={styles.statValue}>{ride.distance.toFixed(1)} km</ThemedText>
            </View>
            <View style={styles.stat}>
              <ThemedText style={styles.statLabel}>Avg Speed</ThemedText>
              <ThemedText style={styles.statValue}>{ride.avgSpeed.toFixed(1)} km/h</ThemedText>
            </View>
            <View style={styles.stat}>
              <ThemedText style={styles.statLabel}>Calories</ThemedText>
              <ThemedText style={styles.statValue}>{Math.round(ride.caloriesBurnt)}</ThemedText>
            </View>
          </View>

          {/* Additional info */}
          <View style={styles.footer}>
            <View style={styles.footerItem}>
              <ThemedText style={styles.footerLabel}>Max Speed:</ThemedText>
              <ThemedText style={styles.footerValue}>{ride.maxSpeed.toFixed(1)} km/h</ThemedText>
            </View>
            {ride.energyRecovered > 0 && (
              <View style={styles.footerItem}>
                <ThemedText style={styles.footerLabel}>Energy:</ThemedText>
                <ThemedText style={styles.footerValue}>{ride.energyRecovered.toFixed(0)} Wh</ThemedText>
              </View>
            )}
          </View>
        </ThemedView>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  date: {
    fontSize: 16,
    fontWeight: '600',
  },
  duration: {
    fontSize: 14,
    opacity: 0.7,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    gap: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(128, 128, 128, 0.2)',
  },
  footerItem: {
    flexDirection: 'row',
    gap: 4,
  },
  footerLabel: {
    fontSize: 12,
    opacity: 0.6,
  },
  footerValue: {
    fontSize: 12,
    fontWeight: '600',
  },
});
