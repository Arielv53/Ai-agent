import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Catches from './components/Catches';
import MonthlyPrediction from './components/MonthlyPrediction';
import MonthlyStatsChart from './components/MonthlyStatsChart';
import PatternAnalysis from './components/PatternAnalysis';
import WelcomeBanner from './components/WelcomeBanner';

export default function ChatTabHome() {
  return (
    <View style={styles.container}>
      <ScrollView>
    
        <WelcomeBanner />

        <Catches />

        <MonthlyStatsChart />
    
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