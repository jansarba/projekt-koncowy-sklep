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

export const Item: React.FC<ItemProps> = ({ id, title, bpm, musical_key, tags, image_url, mp3_url }) => {
  const { setCurrentBeatUrl, setCurrentBeatImage, setCurrentBeatName, setCurrentBeatId, currentBeatId, isPlaying, setIsPlaying } = useMusicPlayer();
  const navigate = useNavigate();

  const isCurrentBeat = currentBeatId === id;

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrentBeat) {
      setIsPlaying((prev) => !prev);
    } else {
      setCurrentBeatUrl(mp3_url);
      setCurrentBeatImage(image_url);
      setCurrentBeatName(title);
      setCurrentBeatId(id);
      setIsPlaying(true);
    }
  };

  const handleNavigate = () => {
    navigate(`/beat/${id}`);
  };

  return (
    <div
      className="relative bg-dark text-text rounded-xl overflow-hidden group hover:bg-light transition-all duration-300 hover:shadow-lg hover:shadow-black/30 cursor-pointer"
      onClick={handleNavigate}
    >
      <div className="relative overflow-hidden">
        <img
          src={image_url}
          alt={title}
          className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <button
          onClick={handlePlay}
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
        >
          <div className="w-14 h-14 rounded-full bg-secondary/90 backdrop-blur-sm flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform duration-300 shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
              {isCurrentBeat && isPlaying
                ? <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                : <path d="M8 5v14l11-7L8 5z" />
              }
            </svg>
          </div>
        </button>
      </div>

      <div className="p-3">
        <h2 className="font-semibold text-sm truncate mb-2">{title}</h2>

        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs px-2 py-0.5 rounded-full bg-darkes text-texthover">{musical_key}</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-darkes text-texthover">{bpm} BPM</span>
        </div>

        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-darkest text-lightest">
                #{tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="text-[10px] px-1.5 py-0.5 text-lightest">+{tags.length - 3}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
