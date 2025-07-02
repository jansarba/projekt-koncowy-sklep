import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Item, ItemProps } from '../Item';
import { useMusicPlayer } from '../../contexts/MusicPlayerContext';
import { useNavigate } from 'react-router-dom';

// Mocks
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));
jest.mock('../../contexts/MusicPlayerContext', () => ({
  useMusicPlayer: jest.fn(),
}));

const mockNavigate = jest.fn();
const mockSetCurrentBeatUrl = jest.fn();
const mockSetCurrentBeatImage = jest.fn();
const mockSetCurrentBeatName = jest.fn();
const mockSetCurrentBeatId = jest.fn();

describe('Item component', () => {
  const itemProps: ItemProps = {
    id: 1,
    title: 'Awesome Beat',
    author_id: 101,
    bpm: 140,
    musical_key: 'A minor',
    tags: ['trap', 'dark'],
    image_url: '/test-image.jpg',
    mp3_url: '/test-audio.mp3',
  };

  beforeEach(() => {
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
    (useMusicPlayer as jest.Mock).mockReturnValue({
      setCurrentBeatUrl: mockSetCurrentBeatUrl,
      setCurrentBeatImage: mockSetCurrentBeatImage,
      setCurrentBeatName: mockSetCurrentBeatName,
      setCurrentBeatId: mockSetCurrentBeatId,
    });
    jest.clearAllMocks();
  });

  it('renders item information correctly', () => {
    render(<Item {...itemProps} />);
    expect(screen.getByText('Awesome Beat')).toBeInTheDocument();
    expect(screen.getByText('A minor')).toBeInTheDocument();
    expect(screen.getByText('140 BPM')).toBeInTheDocument();
    expect(screen.getByAltText('Awesome Beat')).toHaveAttribute('src', '/test-image.jpg');
  });

  it('navigates to beat details page on click', () => {
    render(<Item {...itemProps} />);
    fireEvent.click(screen.getByText('Awesome Beat'));
    expect(mockNavigate).toHaveBeenCalledWith('/beat/1');
  });

  it('calls music player context functions on play button click', () => {
    render(<Item {...itemProps} />);
    fireEvent.click(screen.getByText('▶ Play'));
    expect(mockSetCurrentBeatUrl).toHaveBeenCalledWith('/test-audio.mp3');
    expect(mockSetCurrentBeatImage).toHaveBeenCalledWith('/test-image.jpg');
    expect(mockSetCurrentBeatName).toHaveBeenCalledWith('Awesome Beat');
    expect(mockSetCurrentBeatId).toHaveBeenCalledWith(1);
  });

  it('clicking play button does not navigate to details page', () => {
    render(<Item {...itemProps} />);
    fireEvent.click(screen.getByText('▶ Play'));
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});