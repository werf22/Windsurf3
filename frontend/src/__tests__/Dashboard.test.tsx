import React from 'react';
// Polyfill matchMedia for Chakra UI tests
if (typeof window.matchMedia !== 'function') {
  window.matchMedia = jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }));
}
// Suppress console.error during tests
jest.spyOn(console, 'error').mockImplementation(() => {});

import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import { Dashboard } from '../pages/Dashboard';
import { ChakraProvider } from '@chakra-ui/react';
import theme from '../theme';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Dashboard', () => {
  const tasksMock = [
    { id: 1, name: 'Task One', due_date: null, completed_at: null, created_at: '2025-01-01' },
    { id: 2, name: 'Task Two', due_date: '2025-04-20', completed_at: null, created_at: '2025-02-01' },
    { id: 3, name: 'Task Three', due_date: '2025-04-19', completed_at: '2025-04-19', created_at: '2025-03-01' },
  ];

  beforeEach(() => {
    mockedAxios.get.mockResolvedValue({ data: tasksMock });
  });

  it('renders key metrics and tables correctly', async () => {
    render(
      <ChakraProvider theme={theme}>
        <Dashboard auth={{ username: 'u', password: 'p' }} />
      </ChakraProvider>
    );

    // Wait for data fetch
    await waitFor(() => expect(mockedAxios.get).toHaveBeenCalled());

    // Check metrics
    expect(screen.getByText(/Total Tasks/i)).toBeInTheDocument();
    expect(screen.getByText(/3/)).toBeInTheDocument(); // total
    expect(screen.getByText(/Overdue/i)).toBeInTheDocument();
    expect(screen.getByText(/1/)).toBeInTheDocument(); // overdue
    expect(screen.getByText(/Due Today/i)).toBeInTheDocument();
    expect(screen.getByText(/1/)).toBeInTheDocument(); // due today

    // Check recent activity section
    expect(screen.getByText(/Refresh/i)).toBeInTheDocument();
  });

  it('displays error toast on fetch failure', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

    render(
      <ChakraProvider theme={theme}>
        <Dashboard auth={{ username: 'u', password: 'p' }} />
      </ChakraProvider>
    );

    await waitFor(() => expect(mockedAxios.get).toHaveBeenCalled());

    expect(await screen.findByText(/Error loading dashboard/i)).toBeInTheDocument();
  });
});
