import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import { ThemeProvider } from '@ui5/webcomponents-react';
import 'intersection-observer';
import { act } from 'react-dom/test-utils';

describe('App Component', () => {
  beforeEach(async () => {
    await act(async () => {
      render(
        <ThemeProvider>
          <MemoryRouter>
            <App />
          </MemoryRouter>
        </ThemeProvider>
      );
    });
  });

  it('renders ShellBar', () => {
    const shellBar = screen.getByTestId('shell-header');
    expect(shellBar).toBeTruthy();
  });

  it('navigates to Home page', () => {
    const homePageElement = screen.getByTestId('home-page');
    expect(homePageElement).toBeTruthy();
  });
  
});
