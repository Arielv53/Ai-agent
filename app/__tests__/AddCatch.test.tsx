import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import AddCatch from '../addCatch';

// this test renders the AddCatch screen 
// and presses the "Add Catch" button without selecting an image,
// expecting to see a validation error message.

// Mock expo-router hooks used in AddCatch
jest.mock('expo-router', () => ({
  useRouter: () => ({
    replace: jest.fn(),
    push: jest.fn(),
  }),
  useLocalSearchParams: () => ({}),
}));

// Mock ImagePicker so we don't invoke native functionality
jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(),
  MediaTypeOptions: { Images: 'Images' },
}));

// Mock DateTimePicker to a no-op component
jest.mock('@react-native-community/datetimepicker', () => {
  const React = require('react');
  return function MockDateTimePicker() {
    return null;
  };
});

describe('AddCatch screen', () => {
  it('shows an error when submitting without uploading a photo', async () => {
    const { getByText, findByText } = render(<AddCatch />);

    const addButton = getByText('Add Catch');

    // Try to submit without selecting an image
    fireEvent.press(addButton);

    // The component should display a validation error
    expect(
      await findByText('Please upload a photo of your catch.')
    ).toBeTruthy();
  });
});
