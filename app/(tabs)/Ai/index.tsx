import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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

        <Pressable 
          onPress={() => router.push('/(tabs)/Ai/components/ChatScreen')}
          style={{ marginHorizontal: 90, marginTop: 20 }}
        >
          <View style={styles.glowWrapper}>
            <LinearGradient
              colors={['#020d16ff', '#0d2c41ff', '#041a2bff']} // Pink → purple → blue (similar to your reference)
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientButton}
            >
              <Ionicons name="sparkles" size={23} color="white" style={{ marginRight: 12 }} />
              <Text style={styles.gradientButtonLabel}>AI Assistant</Text>
            </LinearGradient>
          </View>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  glowWrapper: {
    borderRadius: 40,
    padding: 3,
    shadowColor: '#1888a7fb',
    shadowOpacity: 0.9,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 20,
  },
  gradientButton: {
    flexDirection: 'row',
    marginBottom: 30,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 40,              // FULL PILL SHAPE
    // Glow Effect
    shadowColor: '#ff3cac',
    shadowOpacity: 0.55,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,                   // Android glow
  },
  gradientButtonLabel: {
    color: '#ffffffc0',
    fontWeight: '600',
    fontSize: 18,
    letterSpacing: 0.3,
  },
});