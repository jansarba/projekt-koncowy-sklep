import { useNavigate } from 'react-router-dom';
import { useMusicPlayer } from '../contexts/MusicPlayerContext';

export type ItemProps = {
  id: number;
  title: string;
  author_id: number;
  bpm: number;
  musical_key: string;
  tags: string[];
  image_url: string;
  mp3_url: string;
};

export const Item: React.FC<ItemProps> = ({ id, title, bpm, musical_key, image_url, mp3_url }) => {
  const { setCurrentBeatUrl, setCurrentBeatImage, setCurrentBeatName, setCurrentBeatId } = useMusicPlayer();
  const navigate = useNavigate();

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentBeatUrl(mp3_url);
    setCurrentBeatImage(image_url);
    setCurrentBeatName(title);
    setCurrentBeatId(id);
  };

  const handleNavigate = () => {
    navigate(`/beat/${id}`);
  };

  return (
    <div className="relative bg-dark text-slate-100 p-4 rounded-lg group max-w-none hover:cursor-pointer" onClick={handleNavigate}>
      <h2 className="font-bold h-14">{title}</h2>
      <div className="relative">
        <img src={image_url} alt={title} className="rounded-md w-full h-48 object-cover aspect-square" />
        <button onClick={handlePlay} className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-md text-white text-lg font-bold">
          ▶ Play
        </button>
      </div>
      <div className="flex justify-between items-center mt-2 text-sm">
        <p className="text-slate-400">{musical_key}</p>
        <p className="text-slate-400">{bpm} BPM</p>
      </div>
    </div>
  );
};