import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Catches from './components/Catches';
import MonthlyStatsChart from './components/MonthlyStatsChart';
import WelcomeBanner from './components/WelcomeBanner';

export default function ChatTabHome() {
  return (
    <View style={styles.container}>
      <ScrollView>
    
        <WelcomeBanner />

        <Catches />

        <MonthlyStatsChart />
        
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});