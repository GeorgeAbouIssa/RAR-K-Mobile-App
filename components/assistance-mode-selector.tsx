/**
 * Assistance mode selector component - Three-state toggle for bike assistance modes
 */

import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { BikeData } from '@/types/bike-data';

interface AssistanceModeSelectorProps {
  mode: BikeData['assistanceMode'];
  onModeChange: (mode: BikeData['assistanceMode']) => void;
}

const modes:  { value: BikeData['assistanceMode']; label: string; icon: string }[] = [
  { value: 'off', label: 'OFF', icon: '⭕' },
  { value:  'automatic', label: 'AUTO', icon: '🤖' },
  { value:  'hillClimb', label: 'CLIMB', icon: '⛰️' },
];

export function AssistanceModeSelector({ mode, onModeChange }: AssistanceModeSelectorProps) {
  const modeOff = useThemeColor({}, 'modeOff' as any);
  const modeAutomatic = useThemeColor({}, 'modeAutomatic' as any);
  const modeHillClimb = useThemeColor({}, 'modeHillClimb' as any);
  const cardBackground = useThemeColor({}, 'cardBackground' as any);
  const borderColor = useThemeColor({}, 'border' as any);
  const textColor = useThemeColor({}, 'text');
  const selectedTextColor = useThemeColor({ light: '#fff', dark: '#fff' }, 'text');

  const getModeColor = (modeValue: BikeData['assistanceMode']) => {
    switch (modeValue) {
      case 'off':
        return modeOff;
      case 'automatic':
        return modeAutomatic;
      case 'hillClimb':
        return modeHillClimb;
      default:
        return modeOff;
    }
  };

  const handleModePress = (newMode: BikeData['assistanceMode']) => {
    if (newMode !== mode) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onModeChange(newMode);
    }
  };

  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>Assistance Mode</ThemedText>
      <View style={styles.modesContainer}>
        {modes. map((modeOption) => {
          const isSelected = mode === modeOption.value;
          const modeColor = getModeColor(modeOption.value);

          return (
            <Pressable
              key={modeOption.value}
              onPress={() => handleModePress(modeOption.value)}
              style={({ pressed }) => [
                styles. modeButton,
                {
                  backgroundColor: isSelected ?  modeColor : cardBackground,
                  borderColor: isSelected ? modeColor : borderColor,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <View style={styles.iconContainer}>
                <ThemedText 
                  style={[
                    styles.modeIcon, 
                    { 
                      opacity: isSelected ? 1 :  0.5,
                    }
                  ]}
                >
                  {modeOption.icon}
                </ThemedText>
              </View>
              <ThemedText
                style={[
                  styles.modeLabel,
                  {
                    color: isSelected ?  selectedTextColor : textColor,
                    fontWeight: isSelected ? '700' : '600',
                    opacity: isSelected ? 1 : 0.7,
                  },
                ]}
              >
                {modeOption.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
  modesContainer: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
    maxWidth: 400,
    width: '100%',
  },
  modeButton: {
    flex: 1,
    paddingVertical: 18,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 120,
    overflow: 'visible', // Changed from 'hidden' to 'visible'
  },
  iconContainer:  {
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  modeIcon: {
    fontSize: 26,
    lineHeight: 32,
  },
  modeLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
});