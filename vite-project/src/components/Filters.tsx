import React, { useState, useEffect } from 'react';
import Select, { MultiValue, SingleValue } from 'react-select';
import { Range } from 'react-range';
import axios from 'axios';
import { useFilters } from '../contexts/FiltersContext';

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
  { value: 'major', label: 'Major' },
  { value: 'minor', label: 'Minor' },
];

const alterOptions: OptionType[] = [
  { value: '', label: 'Natural' },
  { value: '#', label: 'Sharp (#)' },
  { value: 'b', label: 'Flat (b)' },
];

export const Filters: React.FC = () => {
  const { filters, dispatch } = useFilters();
  const [bpmRange, setBpmRange] = useState(filters.bpmRange);
  const [tags, setTags] = useState<OptionType[]>([]);

  // State for individual parts of the musical key
  const [selectedKey, setSelectedKey] = useState<string>('');
  const [selectedScale, setSelectedScale] = useState<string>('');
  const [selectedAlteration, setSelectedAlteration] = useState<string>('');

  useEffect(() => {
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
  }, []);

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

  return (
    <div className="h-full bg-dark rounded-md text-white">
      <div className="h-full overflow-y-auto p-4">
        <div className="flex justify-between items-center mb-4 gap-2">
          <h2 className="text-lg font-bold">Filters</h2>
          <button onClick={handleResetFilters} className="px-2 py-2 bg-darkes hover:text-texthover transition-colors text-text rounded-md">
            Resetuj
          </button>
        </div>

        <div className="mb-4">
          <label className="block mb-2">Szukaj po tytule</label>
          <input type="text" value={filters.title} onChange={handleTitleChange} className="w-full p-2 border border-gray-500 rounded-md bg-darker text-text" />
        </div>

        <div className="mb-4">
          <label className="block mb-2">Tags</label>
          <Select isMulti options={tags} value={tags.filter((tag) => filters.tags.includes(tag.value))} onChange={handleTagsChange} className="text-black" />
        </div>

        <div className="mb-4">
          <label className="block mb-2">Key</label>
          <Select options={keyOptions} onChange={handleKeyChange} isClearable className="text-black" placeholder="Select a key" />
        </div>

        <div className="mb-4">
          <label className="block mb-2">Alteration</label>
          <Select options={alterOptions} onChange={handleAlterationChange} isClearable className="text-black" placeholder="Select alteration" />
        </div>

        <div className="mb-4">
          <label className="block mb-2">Scale</label>
          <Select options={scaleOptions} onChange={handleScaleChange} isClearable className="text-black" placeholder="Select scale" />
        </div>

        <div className="mb-4">
          <label className="block mb-2">BPM Range</label>
          <Range
            step={1}
            min={10}
            max={300}
            values={bpmRange}
            onChange={handleBpmChange}
            renderTrack={({ props, children }) => (
              <div {...props} className="h-2 bg-gray-600 rounded-md">
                {children}
              </div>
            )}
            renderThumb={({ props }) => <div {...props} className="w-4 h-4 bg-white rounded-full border border-gray-500" />}
          />
          <div className="mt-2 text-sm">{`Range: ${bpmRange[0]} - ${bpmRange[1]}`}</div>
        </div>
      </div>
      <div className="hidden lg:block min-h-48"></div>
    </div>
  );
};