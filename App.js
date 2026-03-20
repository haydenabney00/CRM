import { render, screen } from '@testing-library/react';
import App from './App';

// Mock Supabase — no network in test environment
jest.mock('./supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null } }),
      onAuthStateChange: (_event, cb) => {
        return { data: { subscription: { unsubscribe: () => {} } } };
      },
    },
  },
}));

// Mock react-leaflet — uses DOM APIs unavailable in jsdom
jest.mock('react-leaflet', () => ({
  MapContainer: () => null,
  TileLayer: () => null,
  Marker: () => null,
  Popup: () => null,
}));

jest.mock('leaflet', () => ({
  divIcon: () => ({}),
  icon: () => ({}),
  Icon: {
    Default: {
      prototype: { _getIconUrl: () => {} },
      mergeOptions: () => {},
    },
  },
}));

test('renders CRE OS auth screen when not logged in', async () => {
  render(<App />);
  // Loading state first, then auth screen
  const title = await screen.findByText('CRE OS');
  expect(title).toBeInTheDocument();
});
