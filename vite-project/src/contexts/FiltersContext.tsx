import React, { createContext, useContext, useReducer } from 'react';

export type FiltersState = {
  tags: string[]; // Tags to filter by
  bpmRange: [number, number]; // Range of BPMs
  title: string; // Search by title
  musicalKey: string; // Musical key to filter by (note + scale)
};

const initialFilters: FiltersState = {
  tags: [],
  bpmRange: [10, 300],
  title: '',
  musicalKey: '', // Store note + scale as a string
};

type FiltersAction =
  | { type: 'SET_TAGS'; payload: string[] }
  | { type: 'SET_BPM_RANGE'; payload: [number, number] }
  | { type: 'SET_TITLE'; payload: string }
  | { type: 'SET_KEY'; payload: string }
  | { type: 'RESET_FILTERS' };

const filtersReducer = (state: FiltersState, action: FiltersAction): FiltersState => {
  switch (action.type) {
    case 'SET_TAGS':
      return { ...state, tags: action.payload };
    case 'SET_BPM_RANGE':
      return { ...state, bpmRange: action.payload };
    case 'SET_TITLE':
      return { ...state, title: action.payload };
    case 'SET_KEY':
      return { ...state, musicalKey: action.payload };
    case 'RESET_FILTERS':
      return initialFilters;
    default:
      return state;
  }
};

const FiltersContext = createContext<{
  filters: FiltersState;
  dispatch: React.Dispatch<FiltersAction>;
}>({ filters: initialFilters, dispatch: () => null });

export const FiltersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [filters, dispatch] = useReducer(filtersReducer, initialFilters);

  return (
    <FiltersContext.Provider value={{ filters, dispatch }}>
      {children}
    </FiltersContext.Provider>
  );
};

export const useFilters = () => useContext(FiltersContext);