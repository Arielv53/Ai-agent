import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Catches from './components/Catches';
import MonthlyStatsChart from './components/MonthlyStatsChart';
import MostCaughtSpecies from './components/MostCaughtSpecies';
import WelcomeBanner from './components/WelcomeBanner';

export default function StatsTabHome() {
  return (
    <View style={styles.container}>
      <ScrollView>
    
        <WelcomeBanner />

        <View style={styles.featureRow}>
          <MostCaughtSpecies />

          {/* Future feature goes here */}
          <View style={styles.featurePlaceholder} />
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
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },

  featurePlaceholder: {
    width: "40%",
  },
});