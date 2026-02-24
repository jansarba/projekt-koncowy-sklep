import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { MusicPlayerProvider } from './contexts/MusicPlayerContext';
import { FiltersProvider } from './contexts/FiltersContext';
import { PaginationProvider } from './contexts/PaginationContext';
import { MockProvider } from './contexts/MockContext';
import { BackendUnavailableDialog } from './components/BackendUnavailableDialog';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <MockProvider>
      <MusicPlayerProvider>
        <PaginationProvider>
          <FiltersProvider>
            <BackendUnavailableDialog />
            <App />
          </FiltersProvider>
        </PaginationProvider>
      </MusicPlayerProvider>
    </MockProvider>
  </StrictMode>
);