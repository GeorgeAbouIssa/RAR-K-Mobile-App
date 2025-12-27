/**
 * Stat card component - Reusable component for displaying individual metrics
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: string;
  size?: 'small' | 'medium' | 'large';
}

export function StatCard({ label, value, unit, icon, size = 'medium' }: StatCardProps) {
  const cardBackground = useThemeColor({}, 'cardBackground' as any);
  const borderColor = useThemeColor({}, 'border' as any);

  const sizeStyles = {
    small: {
      padding: 12,
      valueSize: 20,
      labelSize: 12,
      unitSize: 12,
    },
    medium: {
      padding: 16,
      valueSize: 28,
      labelSize: 14,
      unitSize: 14,
    },
    large: {
      padding: 20,
      valueSize: 36,
      labelSize: 16,
      unitSize: 16,
    },
  };

  const currentSize = sizeStyles[size];

  return (
    <ThemedView
      style={[
        styles.container,
        {
          backgroundColor: cardBackground,
          borderColor: borderColor,
          padding: currentSize.padding,
        },
      ]}
    >
      {icon && <ThemedText style={styles.icon}>{icon}</ThemedText>}
      <View style={styles.content}>
        <ThemedText style={[styles.label, { fontSize: currentSize.labelSize }]}>
          {label}
        </ThemedText>
        <View style={styles.valueContainer}>
          <ThemedText style={[styles.value, { fontSize: currentSize.valueSize }]}>
            {value}
          </ThemedText>
          {unit && (
            <ThemedText style={[styles.unit, { fontSize: currentSize.unitSize }]}>
              {unit}
            </ThemedText>
          )}
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 100,
  },
  icon: {
    fontSize: 24,
    marginBottom: 8,
  },
  content: {
    gap: 4,
  },
  label: {
    opacity: 0.7,
    fontWeight: '500',
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  value: {
    fontWeight: 'bold',
  },
  unit: {
    opacity: 0.7,
  },
});
