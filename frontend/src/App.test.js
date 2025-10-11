import { render, screen } from '@testing-library/react';
import App from './App';
import { AppProvider } from './AppContext';

test('renders Welcome screen with the app title', () => {
  render(
    <AppProvider>
      <App />
    </AppProvider>
  );
  const titleElement = screen.getByText(/SafeQuest/i);
  expect(titleElement).toBeInTheDocument();
});
