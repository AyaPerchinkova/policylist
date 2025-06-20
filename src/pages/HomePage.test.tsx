import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import HomePage from './HomePage';
import { mockFetch, mockIntersectionObserver } from '../util/testutil';
import { ThemeProvider } from '@ui5/webcomponents-react';

describe('HomePage component', () => {
  beforeEach(() => {
    mockIntersectionObserver();
    mockFetch();
  });

  it('renders without crashing', () => {
    render(
      <ThemeProvider>
        <BrowserRouter>
          <HomePage />
        </BrowserRouter>
      </ThemeProvider>
    );

    expect(screen.getByTestId('home-page')).toBeTruthy();
  });

  
  it('loads data on mount', async () => {
    const mockData = [{ id: '1', name: 'List 1', type: 'Type 1', ranges: [], createdAt: '2023-01-01' }];
    mockFetch(mockData);

    render(
      <ThemeProvider>
        <BrowserRouter>
          <HomePage />
        </BrowserRouter>
      </ThemeProvider>
    );
    await waitFor(() => expect(screen.getByTestId('home-page')).toBeTruthy());
    await waitFor(() => {
      expect(screen.getByText('List 1')).toBeTruthy();
    });
  });

  it('opens create dialog on button click', async () => {
    render(
      <ThemeProvider>
        <BrowserRouter>
          <HomePage />
        </BrowserRouter>
      </ThemeProvider>
    );

    fireEvent.click(screen.getByTestId('create-button'));

    await waitFor(() => {
      expect(screen.getByTestId('policylist-create-dialog')).toBeTruthy();
    });

    expect(screen.getByLabelText('Name')).toBeTruthy();
  });

  it('handles data fetch error', async () => {
    
    const mockedFetch = mockFetch([], 500);

    render(
      <ThemeProvider>
        <BrowserRouter>
          <HomePage />
        </BrowserRouter>
      </ThemeProvider>
    );

   await waitFor(() => {
    expect(screen.getByTestId('policylist-nodata')).toBeTruthy();
  });

    expect(mockedFetch).toHaveBeenCalled();
  });
  
  it('deletes policy lists', async () => {
    render(
      <ThemeProvider>
        <BrowserRouter>
          <HomePage />
        </BrowserRouter>
      </ThemeProvider>
    );
  
    fireEvent.click(screen.getByTestId('create-delete-button'));
  
    await waitFor(() => {
      expect(screen.getByTestId('policylist-delete-dialog')).toBeTruthy();
    });
  
    fireEvent.click(screen.getByTestId('delete-button'));
  
    await waitFor(() => {
      expect(screen.getByTestId('policylist-delete-dialog')).toBeTruthy();
    });
  
    fireEvent.click(screen.getByTestId('confirm-delete-button'));
    });
});
