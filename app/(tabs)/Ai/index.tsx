import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function ChatTabHome() {
  return (
    <View style={styles.container}>
      {/* Whatever content you want on this tab landing page */}
      <Text style={styles.title}>Chat</Text>

      {/* Floating button in bottom-right, like your Newsfeed addCatch */}
      <Pressable
        style={styles.fab}
        onPress={() => router.push('/(tabs)/Ai/ChatScreen')}
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
  title: {
    fontSize: 24,
    fontWeight: '600',
    margin: 16,
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