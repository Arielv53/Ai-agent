import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

// Component Name: WelcomeBanner
// Purpose: Displays a dynamic greeting (Good Morning, Ariel) with typing animation.

export default function WelcomeBanner() {
  const [displayedText, setDisplayedText] = useState('');
  const typingSpeed = 9;

  const username = 'Ariel'; // You can replace this with a prop or global user state

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return `Good Morning, ${username}.`;
    if (hour < 18) return `Good Afternoon, ${username}.`;
    return `Good Evening, ${username}`;
  })();

  useEffect(() => {
    let i = 0;
    setDisplayedText('');

    const interval = setInterval(() => {
      i++;
      setDisplayedText(greeting.slice(0, i));

      if (i >= greeting.length) {
        clearInterval(interval);
      }
    }, 40);

    return () => clearInterval(interval);
  }, [greeting, typingSpeed]);

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>{displayedText}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  greeting: {
    fontSize: 18,
    fontStyle: 'italic',
    fontWeight: '600',
    color: '#9ee7ff',
    letterSpacing: 0.7,
    marginLeft: 10,
  },
});
