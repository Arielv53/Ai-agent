import { API_BASE } from '@/constants/config';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';
import Newsfeed from '../Newsfeed';

// this test Mocks fetch so the first call returns an array with a single catch.
// Renders Newsfeed and waits for "Bluefin Tuna" to appear in the feed.
// Finds the "0 Likes" text and presses it, which triggers handleLikeToggle, then waits for "1 Likes" to appear.
// 

// Mock expo-router so useRouter doesn't try to navigate for real
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock @expo/vector-icons to avoid native/font issues in Jest
jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { Text } = require('react-native');

  return {
    Ionicons: (props: any) => <Text>{props.name}</Text>,
  };
});

declare const global: any;

describe('Newsfeed screen', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('shows an empty state when there are no public catches', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve([]),
      }) as any
    );

    const { getByText } = render(<Newsfeed />);

    // Wait for the API call to be made
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(`${API_BASE}/public-catches`);
    });

    // After loading finishes, the empty-state text should be visible
    expect(getByText('No public catches yet.')).toBeTruthy();
  });

  it('renders a catch card from the API and allows liking it', async () => {
    const mockCatch = {
      id: 1,
      species: 'Bluefin Tuna',
      image_url: 'https://example.com/fish.jpg',
      user_name: 'Ariel',
      timestamp: new Date().toISOString(),
      like_count: 0,
      comment_count: 0,
    };

    const fetchMock = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve([mockCatch]),
      }) as any
    );

    global.fetch = fetchMock;

    const { findByText, getByText } = render(<Newsfeed />);

    // Wait for the initial fetch to complete and item to appear
    expect(await findByText('Bluefin Tuna')).toBeTruthy();

    const likeText = getByText('0 Likes');

    // Press the like button (pressing the text should bubble to TouchableOpacity)
    fireEvent.press(likeText);

    await waitFor(() => {
      expect(getByText('1 Likes')).toBeTruthy();
    });

    // First call is the initial fetch, second call should be the like API
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock).toHaveBeenLastCalledWith(
      expect.stringMatching(`${API_BASE}/catches/1/like`),
      expect.objectContaining({ method: 'POST' })
    );
  });
});
