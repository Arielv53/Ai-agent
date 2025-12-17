import { API_BASE } from '@/constants/config';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

export default function XpBar() {
  const [userProgress, setUserProgress] = useState({
    level: 1,
    prestige: 0,
    postsTowardNextLevel: 0,
    postsRequiredForNextLevel: 1,
  });

  const progressAnim = useRef(new Animated.Value(0)).current;

  // Compute progress fraction
  const progress =
    userProgress.postsRequiredForNextLevel > 0
      ? userProgress.postsTowardNextLevel / userProgress.postsRequiredForNextLevel
      : 0;

  // Animate progress bar whenever progress changes
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  // Fetch mock user progress on mount
  useEffect(() => {
    async function fetchUserProgress() {
      try {
        // TODO: replace with auth-based endpoint later
        const userId = 1;

        const res = await fetch(`${API_BASE}/users/${userId}/profile`
        );
        const data = await res.json();

        setUserProgress({
          level: data.level,
          prestige: data.prestige,
          postsTowardNextLevel: data.posts_toward_next_level,
          postsRequiredForNextLevel: data.posts_required_for_next_level,
        });
      } catch (err) {
        console.log('Failed to fetch user progress', err);
      }
    }

    fetchUserProgress();
  }, []);

  // Prestige badge logic
  const prestigeBadges: Record<number, string> = {
    1: '🐠',
    2: '🐡',
    3: '🦈',
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.levelText}>Lv {userProgress.level}</Text>
        
        {userProgress.prestige > 0 && (
          <Text style={styles.prestige}>
            {prestigeBadges[userProgress.prestige]} Prestige {''}
            {userProgress.prestige}
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
        {userProgress.postsTowardNextLevel}/{userProgress.postsRequiredForNextLevel} posts to next
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
    backgroundColor: '#3fa9f5',
  },
  progressText: {
    marginTop: 4,
    fontSize: 12,
    color: '#ccc',
  },
});
