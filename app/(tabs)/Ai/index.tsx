import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import ConditionsPattern from './components/ConditionsPattern';

export default function ChatTabHome() {
  return (
    <View style={styles.container}>

      <ConditionsPattern />

      {/* Floating button in bottom-right, like your Newsfeed addCatch */}
      <Pressable
        style={styles.fab}
        onPress={() => router.push('/(tabs)/Ai/components/ChatScreen')}
      >
        <Text style={styles.fabLabel}>🤖</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  fab: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    borderRadius: 50,
    paddingHorizontal: 20,
    paddingVertical: 14,

    backgroundColor: '#062336',            // UPDATED – dark glossy button
    borderWidth: 1,                        // NEW
    borderColor: 'rgba(0, 200, 255, 0.35)', // NEW – neon border

    // Glow shadow
    shadowColor: '#00c8ff',               // NEW – neon cyan glow
    shadowOpacity: 0.45,                  // NEW
    shadowRadius: 18,                     // NEW
    shadowOffset: { width: 0, height: 0 }, // NEW

    elevation: 10,                        // UPDATED – stronger Android glow
  },

  fabLabel: {
    color: '#d7f8ff',                      // UPDATED – neon text
    fontWeight: '600',
    fontSize: 18,                          // UPDATED – cleaner look
    letterSpacing: 0.3,                    // NEW
  },
});