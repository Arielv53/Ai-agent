import { router } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import MonthlyPrediction from './components/MonthlyPrediction';
import PatternAnalysis from './components/PatternAnalysis';
import WelcomeBanner from './components/WelcomeBanner';

export default function ChatTabHome() {
  return (
    <View style={styles.container}>
      <ScrollView>
        <WelcomeBanner />
        
        <PatternAnalysis />

        <MonthlyPrediction />

        {/* Floating button in bottom-right, like your Newsfeed addCatch */}
        <Pressable
          style={styles.fab}
          onPress={() => router.push('/(tabs)/Ai/components/ChatScreen')}
        >
          <Text style={styles.fabLabel}>🤖</Text>
        </Pressable>
      </ScrollView>
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
  },

  fabLabel: {
    color: '#d7f8ff',                      // UPDATED – neon text
    fontWeight: '600',
    fontSize: 25,                          // UPDATED – cleaner look
    letterSpacing: 0.3,                    // NEW
  },
});