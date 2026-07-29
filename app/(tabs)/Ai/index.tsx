import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import MonthlyPrediction from './components/MonthlyPrediction';
import PatternAnalysis from './components/PatternAnalysis';
import WelcomeBanner from './components/WelcomeBanner';
import Catches from './components/catches';

export default function ChatTabHome() {
  return (
    <View style={styles.container}>
      <ScrollView>
    
        <WelcomeBanner />

        <Catches />
    
        <PatternAnalysis />

        <MonthlyPrediction />

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});