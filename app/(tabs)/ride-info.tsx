import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, View, Platform, RefreshControl } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { RideHistoryCard } from '@/components/ride-history-card';
import { StatCard } from '@/components/stat-card';
import { useRides } from '@/hooks/use-rides';

export default function RideInfoScreen() {
  const { rides, loading, error, refresh, getStatistics } = useRides();
  const [stats, setStats] = useState({
    totalRides: 0,
    totalDistance: 0,
    totalDuration: 0,
    avgSpeed: 0,
    totalCalories: 0,
  });
  const [refreshing, setRefreshing] = useState(false);

  // Load statistics
  useEffect(() => {
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rides]);

  const loadStats = async () => {
    const statistics = await getStatistics();
    if (statistics) {
      setStats(statistics);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    await loadStats();
    setRefreshing(false);
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // Generate some sample rides if none exist (for demo)
  useEffect(() => {
    // Could add sample data here for demonstration
  }, []);

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <ThemedText type="title">Ride History</ThemedText>
          <ThemedText style={styles.subtitle}>
            {stats.totalRides} {stats.totalRides === 1 ? 'ride' : 'rides'} recorded
          </ThemedText>
        </View>

        {/* Overall Statistics */}
        {stats.totalRides > 0 && (
          <View style={styles.statsSection}>
            <ThemedText style={styles.sectionTitle}>Overall Stats</ThemedText>
            <View style={styles.statsGrid}>
              <StatCard
                label="Total Distance"
                value={stats.totalDistance.toFixed(1)}
                unit="km"
                icon="🚴"
                size="small"
              />
              <StatCard
                label="Total Time"
                value={formatDuration(stats.totalDuration)}
                icon="⏱️"
                size="small"
              />
              <StatCard
                label="Avg Speed"
                value={stats.avgSpeed.toFixed(1)}
                unit="km/h"
                icon="⚡"
                size="small"
              />
              <StatCard
                label="Calories"
                value={Math.round(stats.totalCalories)}
                unit="kcal"
                icon="🔥"
                size="small"
              />
            </View>
          </View>
        )}

        {/* Rides List */}
        <View style={styles.ridesSection}>
          <ThemedText style={styles.sectionTitle}>Recent Rides</ThemedText>
          
          {loading && (
            <ThemedText style={styles.emptyText}>Loading rides...</ThemedText>
          )}

          {error && (
            <ThemedText style={styles.errorText}>Error: {error}</ThemedText>
          )}

          {!loading && rides.length === 0 && (
            <View style={styles.emptyContainer}>
              <ThemedText style={styles.emptyIcon}>🚴‍♂️</ThemedText>
              <ThemedText style={styles.emptyText}>No rides yet</ThemedText>
              <ThemedText style={styles.emptySubtext}>
                Start riding to see your stats here
              </ThemedText>
            </View>
          )}

          {!loading && rides.map((ride) => (
            <RideHistoryCard key={ride.id} ride={ride} />
          ))}
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
    paddingTop: Platform.OS === 'android' || Platform.OS === 'ios' ? 60 : 16,
  },
  header: {
    marginBottom: 24,
  },
  subtitle: {
    fontSize: 16,
    marginTop: 8,
    opacity: 0.7,
  },
  statsSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  ridesSection: {
    marginBottom: 40,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#F44336',
    textAlign: 'center',
    padding: 16,
  },
});
