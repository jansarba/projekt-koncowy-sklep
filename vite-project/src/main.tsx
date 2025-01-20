import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { MusicPlayerProvider } from './contexts/MusicPlayerContext.tsx'; // Make sure MusicPlayerContext is properly imported
import { FiltersProvider } from './contexts/FiltersContext.tsx';


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MusicPlayerProvider>
      <FiltersProvider>
        <App />
      </FiltersProvider>
    </MusicPlayerProvider>
  </StrictMode>
);