import React, { useState, useEffect } from 'react';
import { useFilters } from '../contexts/FiltersContext';
import Select from 'react-select';
import { Range } from 'react-range';
import axios from 'axios';
const baseURL = import.meta.env.VITE_API_BASE_URL;

type Tag = {
  value: string;
  label: string;
};

const keyOptions = [
  { value: 'C', label: 'C' },
  { value: 'D', label: 'D' },
  { value: 'E', label: 'E' },
  { value: 'F', label: 'F' },
  { value: 'G', label: 'G' },
  { value: 'A', label: 'A' },
  { value: 'B', label: 'B' },
];

const scaleOptions = [
  { value: 'major', label: 'Major' },
  { value: 'minor', label: 'Minor' },
];

const alterOptions = [
  { value: '', label: 'Natural' },
  { value: '#', label: 'Sharp (#)' },
  { value: 'b', label: 'Flat (b)' },
];

export const Filters: React.FC = () => {
  const { filters, dispatch } = useFilters();
  const [bpmRange, setBpmRange] = useState(filters.bpmRange);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedKey, setSelectedKey] = useState(filters.musicalKey.split(' ')[0] || '');
  const [selectedScale, setSelectedScale] = useState(filters.musicalKey.split(' ')[1] || '');
  const [selectedAlteration, setSelectedAlteration] = useState(
    filters.musicalKey.split(' ')[0].includes('#') || filters.musicalKey.split(' ')[0].includes('b') 
      ? filters.musicalKey.split(' ')[0].charAt(filters.musicalKey.split(' ')[0].length - 1) 
      : ''
  );

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await axios.get(`${baseURL}/api/tags`);
        console.log('Tags from API:', response.data);
  
        // Normalize tags to lowercase and remove duplicates
        const normalizedTags = response.data
          .map((tag: { value: string, label: string }) => ({
            ...tag,
            value: tag.value.toLowerCase(), // normalize value to lowercase
            label: tag.label.toLowerCase(), // normalize label to lowercase
          }))
          // Remove duplicates based on the normalized value
          .filter((value: { value: string }, index: number, self: { findIndex: Function }) => 
            index === self.findIndex((t: { value: string }) => t.value === value.value)
          );
  
        setTags(normalizedTags);
      } catch (error) {
        console.error('Error fetching tags:', error);
      }
    };
  
    fetchTags();
  }, []);

  const handleTagsChange = (selected: any) => {
    // Normalize the selected tags to lowercase
    const normalizedSelected = selected ? selected.map((option: any) => option.value.toLowerCase()) : [];
  
    dispatch({
      type: 'SET_TAGS',
      payload: normalizedSelected,
    });
  };

  const handleKeyChange = (selected: any) => {
    setSelectedKey(selected ? selected.value : '');
    const musicalKey = `${selected ? selected.value : ''} ${selectedScale}`;
    dispatch({
      type: 'SET_KEY',
      payload: musicalKey,
    });
  };

  const handleScaleChange = (selected: any) => {
    setSelectedScale(selected ? selected.value : '');
    const musicalKey = `${selectedKey}${selectedAlteration} ${selected ? selected.value : ''}`;
    dispatch({
      type: 'SET_KEY',
      payload: musicalKey,
    });
  };

  const handleAlterationChange = (selected: any) => {
    setSelectedAlteration(selected ? selected.value : '');
    const musicalKey = `${selectedKey}${selected ? selected.value : ''} ${selectedScale}`;
    dispatch({
      type: 'SET_KEY',
      payload: musicalKey,
    });
  };

  const handleBpmChange = (range: [number, number]) => {
    setBpmRange(range);
    dispatch({ type: 'SET_BPM_RANGE', payload: range });
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
    setTags(tags.map(tag => ({ ...tag, isSelected: false }))); // Reset the selection
    dispatch({
    type: 'SET_TAGS',
      payload: [],
    });
  };

  return (
    <div className="h-full bg-dark rounded-md text-white">
      <div className="h-full overflow-y-auto p-4">
        <div className='flex justify-between items-center mb-4 gap-2'>
            <h2 className="text-lg font-bold">Filters</h2>
            <button
            onClick={handleResetFilters}
            className="px-2 py-2 bg-darkes hover:text-texthover transition-colors text-text rounded-md"
            >
            Reset Filters
            </button>
        </div>

        {/* Filter by Title */}
        <div className="mb-4">
          <label className="block mb-2">Search by Title</label>
          <input
            type="text"
            value={filters.title}
            onChange={handleTitleChange}
            className="w-full p-2 border border-gray-500 rounded-md bg-darker text-text"
          />
        </div>

        {/* Filter by Tags */}
        <div className="mb-4">
          <label className="block mb-2">Tags</label>
          <Select
            isMulti
            options={tags}
            value={tags.filter(tag => filters.tags.includes(tag.value))}
            onChange={handleTagsChange}
            className="text-black"
          />
        </div>

        {/* Filter by Key */}
        <div className="mb-4">
          <label className="block mb-2">Key</label>
          <Select
            options={keyOptions}
            onChange={handleKeyChange}
            isClearable
            className="text-black"
            placeholder="Select a key"
          />
        </div>

        {/* Filter by Alteration */}
        <div className="mb-4">
          <label className="block mb-2">Alteration</label>
          <Select
            options={alterOptions}
            onChange={handleAlterationChange}
            isClearable
            className="text-black"
            placeholder="Select alteration"
          />
        </div>

        {/* Filter by Scale */}
        <div className="mb-4">
          <label className="block mb-2">Scale</label>
          <Select
            options={scaleOptions}
            onChange={handleScaleChange}
            isClearable
            className="text-black"
            placeholder="Select scale"
          />
        </div>

        {/* Filter by BPM Range */}
        <div className="mb-4">
          <label className="block mb-2">BPM Range</label>
          <Range
            step={1}
            min={10}
            max={300}
            values={bpmRange}
            onChange={(range) => handleBpmChange(range as [number, number])}
            renderTrack={({ props, children }) => (
              <div {...props} className="h-2 bg-gray-600 rounded-md">{children}</div>
            )}
            renderThumb={({ props }) => (
              <div
                {...props}
                className="w-4 h-4 bg-white rounded-full border border-gray-500"
              />
            )}
          />
          <div className="mt-2 text-sm">{`Range: ${bpmRange[0]} - ${bpmRange[1]}`}</div>
        </div>

      </div>
      <div className="hidden lg:block min-h-48"></div>
    </div>
  );
};