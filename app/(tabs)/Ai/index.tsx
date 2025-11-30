import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import ConditionsPattern from './components/ConditionsPattern';

export default function ChatTabHome() {
  return (
    <View style={styles.container}>

      <ConditionsPattern />

      {/* Floating button in bottom-right, like your Newsfeed addCatch */}
      <Pressable
        style={styles.fab}
        onPress={() => router.push('/(tabs)/Ai/components/ChatScreen')}
      >
        <Text style={styles.fabLabel}>Open Chat</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#007AFF', // match your theme
    elevation: 4,               // Android shadow
    shadowColor: '#000',        // iOS shadow
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  fabLabel: {
    color: 'white',
    fontWeight: '600',
  },
});