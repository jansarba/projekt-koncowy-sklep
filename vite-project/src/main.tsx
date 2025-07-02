import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { MusicPlayerProvider } from './contexts/MusicPlayerContext';
import { FiltersProvider } from './contexts/FiltersContext';
import { PaginationProvider } from './contexts/PaginationContext';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <MusicPlayerProvider>
      <PaginationProvider>
        <FiltersProvider>
          <App />
        </FiltersProvider>
      </PaginationProvider>
    </MusicPlayerProvider>
  </StrictMode>
);