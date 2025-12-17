import { useUserProgress } from '@/contexts/UserProgressContext';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

export default function XpBar() {
  const { progress } = useUserProgress(); 
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Compute progress fraction
  const fraction =
    progress.postsRequiredForNextLevel > 0
      ? progress.postsTowardNextLevel / progress.postsRequiredForNextLevel
      : 0;

  // Animate progress bar whenever progress changes
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: fraction,
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, [fraction]);

  // Prestige badge logic
  const prestigeBadges: Record<number, string> = {
    1: '🐠',
    2: '🐡',
    3: '🦈',
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.levelText}>Lv {progress.level}</Text>
        
        {progress.prestige > 0 && (
          <Text style={styles.prestige}>
            {prestigeBadges[progress.prestige]} Prestige
            {progress.prestige}
          </Text> 
        )}
      </View>

      <View style={styles.barBackground}>
        <Animated.View
          style={[
            styles.barFill,
            {
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>

      <Text style={styles.progressText}>
        {progress.postsTowardNextLevel}/{progress.postsRequiredForNextLevel} posts to next
        level
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  levelText: {
    color: '#e6f1ff',
    fontWeight: '600',
    fontSize: 17,
  },
  prestige: {
    color: '#ffd166',
    fontWeight: '600',
  },
  barBackground: {
    height: 12,
    backgroundColor: '#1e2a36',
    borderRadius: 6,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: '#00c8ff6f',
  },
  progressText: {
    marginTop: 4,
    fontSize: 12,
    color: '#ccc',
  },
});
