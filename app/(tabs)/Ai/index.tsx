import XpBar from '@/components/XpBar';
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
        <XpBar />
        
        <WelcomeBanner />

        <PatternAnalysis />

        <MonthlyPrediction />

        <Pressable 
          onPress={() => router.push('/(tabs)/Ai/components/ChatScreen')}
          style={{ marginHorizontal: 120, marginTop: 20 }}
        >
          <View style={styles.glowWrapper}>
            <LinearGradient
              colors={['#051726ff', '#07151fff', '#03121eff']} // Pink → purple → blue (similar to your reference)
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientButton}
            >
              <Text style={styles.botIcon}>🤖</Text>
              <Text style={styles.gradientButtonLabel}>Chat</Text>
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
    padding: 0,
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
    paddingVertical: 10,
    borderRadius: 40,              // FULL PILL SHAPE
    // Glow Effect
    shadowColor: '#ff3cac',
    shadowOpacity: 0.55,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,                   // Android glow
  },
  gradientButtonLabel: {
    color: '#9ee7ff',
    fontWeight: '600',
    fontSize: 18,
    letterSpacing: 0.3,
  },
  botIcon: {
    fontSize: 32,
    marginRight: 4,
  },
});