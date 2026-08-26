import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Catches from './components/Catches';
import MonthlyStatsChart from './components/MonthlyStatsChart';
import MostCaughtSpecies from './components/MostCaughtSpecies';
import MostUsedLure from './components/MostUsedLure';
import WelcomeBanner from './components/WelcomeBanner';

export default function StatsTabHome() {
  return (
    <View style={styles.container}>
      <ScrollView>
    
        <WelcomeBanner />

        <View style={styles.featureRow}>
          <View style={styles.cardSlot}>
            <MostCaughtSpecies />
          </View>

          <View style={styles.cardSlot}>
            <MostUsedLure />
          </View>
        </View>

        <MonthlyStatsChart />

        <Catches />
        
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020d16ff',
  },
  featureRow: {
    flexDirection: "row",
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 10,
  },
  cardSlot: {
    flex: 1,
  },
});