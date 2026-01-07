import React from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function SettingsScreen() {
  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <ThemedText type="title">Settings</ThemedText>
        <ThemedText style={styles.subtitle}>
          Configure your RAR-Kit preferences
        </ThemedText>
        
        <View style={styles.placeholder}>
          <ThemedText style={styles.placeholderText}>
            ⚙️ Settings coming soon
          </ThemedText>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
    paddingTop: Platform.OS === 'android' || Platform.OS === 'ios' ? 60 : 16,
  },
  subtitle:  {
    fontSize: 16,
    marginTop: 8,
    marginBottom: 32,
    opacity: 0.7,
  },
  placeholder:  {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText:  {
    fontSize: 18,
    opacity: 0.5,
  },
});