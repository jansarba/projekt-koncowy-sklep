import { useNavigate } from 'react-router-dom';
import { useMusicPlayer } from '../contexts/MusicPlayerContext'; // Adjust the path if necessary
// import silence from "../bruh/silence.mp3"; // Adjust path as needed

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

export const Item = (item: ItemProps) => {
  const { setCurrentBeatUrl, setCurrentBeatImage, setCurrentBeatName, setCurrentBeatId } = useMusicPlayer(); // Access the context
  const navigate = useNavigate();

  const handlePlay = () => {
    setCurrentBeatUrl(item.mp3_url); // Set the beat URL in the context
    setCurrentBeatImage(item.image_url); // Set the beat image in the context
    setCurrentBeatName(item.title); // Set the beat name in the context
    setCurrentBeatId(item.id); // Set the beat ID in the context
  };

  const handleNavigate = () => {
    // Navigate to the beat details page, passing the beat ID
    navigate(`/beat/${item.id}`);
  };

  return (
    <div
      className="relative bg-dark text-slate-100 p-4 rounded-lg group max-w-none hover:cursor-pointer"
      onClick={handleNavigate} // Navigate when clicking anywhere except the image
    >
      {/* Title */}
      <h2 className="font-bold h-14">{item.title}</h2>

      {/* Image with Play Button */}
      <div className="relative">
        <img
          src={item.image_url}
          alt={item.title}
          className="rounded-md w-full h-48 object-cover aspect-square"
        />
        <button
          onClick={(e) => {
            e.stopPropagation(); // Prevent navigation when clicking the image
            handlePlay(); // Set both beat URL and image in the context
          }}
          className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-md text-white text-lg font-bold"
        >
          ▶ Play
        </button>
      </div>

      {/* Info Below Image */}
      <div className="flex justify-between items-center mt-2 text-sm">
        <p className="text-slate-400">{item.musical_key}</p>
        <p className="text-slate-400">{item.bpm} BPM</p>
      </div>
    </div>
  );
};