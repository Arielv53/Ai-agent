import React from 'react';
import { render } from '@testing-library/react-native';

import { ThemedText } from '../ThemedText';

// Mock the theme hook so the test doesn't depend on the real theme implementation
jest.mock('@/hooks/useThemeColor', () => ({
  useThemeColor: () => '#000000',
}));

describe('ThemedText', () => {
  it('renders the provided text', () => {
    const { getByText } = render(<ThemedText>Hello from a test</ThemedText>);

    expect(getByText('Hello from a test')).toBeTruthy();
  });
});
