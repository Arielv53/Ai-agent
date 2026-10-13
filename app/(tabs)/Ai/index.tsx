import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Catches from './components/Catches';
import FishingProgressCards from './components/FishingProgressCards';
import MonthlyStatsChart from './components/MonthlyStatsChart';
import MostCaughtSpecies from './components/MostCaughtSpecies';
import MostProductiveLocation from './components/MostProductiveLocation';
import MostUsedLure from './components/MostUsedLure';
import PersonalRecords from './components/PersonalRecords';
import PremiumPatternCards from './components/PremiumPatternCards';
import PrivateLocationNotes from './components/PrivateLocationNotes';
import QuickInsights from './components/QuickInsights';
import WelcomeBanner from './components/WelcomeBanner';
import YearOverYearReview from './components/YearOverYearReview';

export default function StatsTabHome() {
  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
      >
    
        <WelcomeBanner />

        <View style={styles.featureRow}>
          <View style={styles.cardSlot}>
            <MostCaughtSpecies />
          </View>

          <View style={styles.cardSlot}>
            <MostUsedLure />
          </View>
        </View>

        <MostProductiveLocation />

        <Catches />

        <QuickInsights />

        <Text style={styles.sectionTitle}>
          More Insights
        </Text>

        <PersonalRecords />

        <FishingProgressCards />

        <View style={styles.premiumHeading}>
          <Text style={styles.premiumTitle}>
            Premium Intelligence
          </Text>

          <View style={styles.premiumLine} />
        </View>

        <PrivateLocationNotes />

        <PremiumPatternCards />

        <MonthlyStatsChart />

        <YearOverYearReview />
        
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020d16ff',
  },
  scrollContent: {
    paddingBottom: 100,
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
  sectionTitle: {
    color: "#e5eaed",
    fontSize: 16,
    fontWeight: "700",
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 10,
  },
  premiumHeading: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 5,
    marginBottom: 10,
  },
  premiumTitle: {
    color: "#f5b20b",
    fontSize: 14,
    fontWeight: "700",
  },
  premiumLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#4f421b",
    marginLeft: 10,
  },
});
