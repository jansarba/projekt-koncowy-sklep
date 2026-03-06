import React, { useState, useEffect } from 'react';
import Select, { MultiValue, SingleValue, StylesConfig } from 'react-select';
import { Range } from 'react-range';
import axios from 'axios';
import { useFilters } from '../contexts/FiltersContext';
import { useMock } from '../contexts/MockContext';

const baseURL = import.meta.env.VITE_API_BASE_URL;

type OptionType = {
  value: string;
  label: string;
};

const keyOptions: OptionType[] = [
  { value: 'C', label: 'C' },
  { value: 'D', label: 'D' },
  { value: 'E', label: 'E' },
  { value: 'F', label: 'F' },
  { value: 'G', label: 'G' },
  { value: 'A', label: 'A' },
  { value: 'B', label: 'B' },
];

const scaleOptions: OptionType[] = [
  { value: 'major', label: 'Dur' },
  { value: 'minor', label: 'Moll' },
];

const alterOptions: OptionType[] = [
  { value: '', label: 'Nat.' },
  { value: '#', label: '#' },
  { value: 'b', label: 'b' },
];

const darkSelectStyles: StylesConfig<OptionType, boolean> = {
  control: (base, state) => ({
    ...base,
    backgroundColor: '#1a1919',
    borderColor: state.isFocused ? '#A04747' : '#3B3737',
    borderRadius: '0.5rem',
    minHeight: '38px',
    boxShadow: 'none',
    '&:hover': { borderColor: '#4e4a4a' },
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: '#1a1919',
    border: '1px solid #3B3737',
    borderRadius: '0.5rem',
    overflow: 'hidden',
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected ? '#A04747' : state.isFocused ? '#272525' : 'transparent',
    color: '#F1F5F9',
    fontSize: '0.875rem',
    '&:active': { backgroundColor: '#343131' },
  }),
  singleValue: (base) => ({
    ...base,
    color: '#F1F5F9',
    fontSize: '0.875rem',
  }),
  multiValue: (base) => ({
    ...base,
    backgroundColor: '#343131',
    borderRadius: '0.375rem',
  }),
  multiValueLabel: (base) => ({
    ...base,
    color: '#F1F5F9',
    fontSize: '0.75rem',
  }),
  multiValueRemove: (base) => ({
    ...base,
    color: '#C0C4C7',
    '&:hover': { backgroundColor: '#A04747', color: '#F1F5F9' },
  }),
  placeholder: (base) => ({
    ...base,
    color: '#4e4a4a',
    fontSize: '0.875rem',
  }),
  input: (base) => ({
    ...base,
    color: '#F1F5F9',
    fontSize: '0.875rem',
  }),
  indicatorSeparator: (base) => ({
    ...base,
    backgroundColor: '#3B3737',
  }),
  dropdownIndicator: (base) => ({
    ...base,
    color: '#4e4a4a',
    '&:hover': { color: '#C0C4C7' },
  }),
  clearIndicator: (base) => ({
    ...base,
    color: '#4e4a4a',
    '&:hover': { color: '#C0C4C7' },
  }),
};

export const Filters: React.FC = () => {
  const { filters, dispatch } = useFilters();
  const [bpmRange, setBpmRange] = useState(filters.bpmRange);
  const [tags, setTags] = useState<OptionType[]>([]);
  const { isMockMode, checkingBackend } = useMock();

  const [selectedKey, setSelectedKey] = useState<string>('');
  const [selectedScale, setSelectedScale] = useState<string>('');
  const [selectedAlteration, setSelectedAlteration] = useState<string>('');

  useEffect(() => {
    if (checkingBackend) return;
    if (isMockMode) {
      setTags([{ value: 'trap', label: 'trap' }, { value: 'dark', label: 'dark' }, { value: 'chill', label: 'chill' }, { value: 'lofi', label: 'lofi' }]);
      return;
    }
    const fetchTags = async () => {
      try {
        const response = await axios.get<OptionType[]>(`${baseURL}/api/tags`);
        const uniqueTags = response.data.reduce((acc: OptionType[], current) => {
          if (!acc.some((item) => item.value === current.value)) {
            acc.push(current);
          }
          return acc;
        }, []);
        setTags(uniqueTags);
      } catch (error) {
        console.error('Error fetching tags:', error);
      }
    };
    fetchTags();
  }, [isMockMode, checkingBackend]);

  useEffect(() => {
    const musicalKey = `${selectedKey}${selectedAlteration} ${selectedScale}`.trim();
    dispatch({ type: 'SET_KEY', payload: musicalKey });
  }, [selectedKey, selectedAlteration, selectedScale, dispatch]);

  const handleTagsChange = (selectedOptions: MultiValue<OptionType>) => {
    const selectedValues = selectedOptions ? selectedOptions.map((option) => option.value) : [];
    dispatch({ type: 'SET_TAGS', payload: selectedValues });
  };

  const handleKeyChange = (selectedOption: SingleValue<OptionType>) => {
    setSelectedKey(selectedOption ? selectedOption.value : '');
  };

  const handleScaleChange = (selectedOption: SingleValue<OptionType>) => {
    setSelectedScale(selectedOption ? selectedOption.value : '');
  };

  const handleAlterationChange = (selectedOption: SingleValue<OptionType>) => {
    setSelectedAlteration(selectedOption ? selectedOption.value : '');
  };

  const handleBpmChange = (range: number[]) => {
    const newRange: [number, number] = [range[0], range[1]];
    setBpmRange(newRange);
    dispatch({ type: 'SET_BPM_RANGE', payload: newRange });
  };

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'SET_TITLE', payload: event.target.value });
  };

  const handleResetFilters = () => {
    dispatch({ type: 'RESET_FILTERS' });
    setSelectedKey('');
    setSelectedScale('');
    setSelectedAlteration('');
    setBpmRange([10, 300]);
  };

  const trackFillPercent = (value: number) => ((value - 10) / (300 - 10)) * 100;

  return (
    <div className="h-full bg-dark rounded-lg text-text">
      <div className="h-full overflow-y-auto p-4" style={{ scrollbarWidth: 'none' }}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-bold text-lg tracking-wider">FILTRY</h2>
          <button
            onClick={handleResetFilters}
            className="text-xs text-lightest hover:text-text border border-light/30 hover:border-lightest px-2.5 py-1 rounded-md transition-all duration-200"
          >
            Resetuj
          </button>
        </div>

        <div className="mb-5">
          <label className="block mb-1.5 text-xs text-texthover uppercase tracking-wider">Szukaj po tytule</label>
          <input
            type="text"
            value={filters.title}
            onChange={handleTitleChange}
            placeholder="Wpisz tytuł..."
            className="w-full px-3 py-2 border border-light/30 rounded-lg bg-darker text-text text-sm placeholder:text-lightest focus:outline-none focus:border-secondary transition-colors duration-200"
          />
        </div>

        <div className="mb-5">
          <label className="block mb-1.5 text-xs text-texthover uppercase tracking-wider">Tagi</label>
          <Select<OptionType, true>
            isMulti
            options={tags}
            value={tags.filter((tag) => filters.tags.includes(tag.value))}
            onChange={handleTagsChange}
            styles={darkSelectStyles}
            placeholder="Wybierz tagi..."
          />
        </div>

        <div className="mb-5">
          <label className="block mb-1.5 text-xs text-texthover uppercase tracking-wider">Tonacja</label>
          <Select<OptionType, false>
            options={keyOptions}
            onChange={handleKeyChange}
            isClearable
            styles={darkSelectStyles}
            placeholder="Wybierz tonację"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 mb-5">
          <div>
            <label className="block mb-1.5 text-xs text-texthover uppercase tracking-wider">♯/♭</label>
            <Select<OptionType, false>
              options={alterOptions}
              onChange={handleAlterationChange}
              isClearable
              styles={darkSelectStyles}
              placeholder="—"
            />
          </div>
          <div>
            <label className="block mb-1.5 text-xs text-texthover uppercase tracking-wider">Skala</label>
            <Select<OptionType, false>
              options={scaleOptions}
              onChange={handleScaleChange}
              isClearable
              styles={darkSelectStyles}
              placeholder="—"
            />
          </div>
        </div>

        <div className="mb-5">
          <label className="block mb-3 text-xs text-texthover uppercase tracking-wider">Zakres BPM</label>
          <Range
            step={1}
            min={10}
            max={300}
            values={bpmRange}
            onChange={handleBpmChange}
            renderTrack={({ props, children }) => (
              <div {...props} className="h-1.5 bg-lighter/30 rounded-full relative">
                <div
                  className="absolute h-full bg-secondary rounded-full"
                  style={{
                    left: `${trackFillPercent(bpmRange[0])}%`,
                    width: `${trackFillPercent(bpmRange[1]) - trackFillPercent(bpmRange[0])}%`,
                  }}
                />
                {children}
              </div>
            )}
            renderThumb={({ props }) => (
              <div
                {...props}
                className="w-4 h-4 bg-text rounded-full shadow-md border-2 border-secondary focus:outline-none"
              />
            )}
          />
          <div className="mt-2 flex justify-between text-xs text-lightest">
            <span>{bpmRange[0]} BPM</span>
            <span>{bpmRange[1]} BPM</span>
          </div>
        </div>
      </div>
      <div className="hidden lg:block min-h-48"></div>
    </div>
  );
};
