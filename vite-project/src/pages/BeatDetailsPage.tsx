/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import WaveformOverlay from '../components/WaveformOverlay';
import { Licenses, License } from '../components/Licenses';

const baseURL = import.meta.env.VITE_API_BASE_URL;

interface BeatDetails {
  id: number;
  title: string;
  bpm: number;
  musical_key: string;
  authors: string[];
  tags: string[];
  image_url: string;
  mp3_url: string;
  sample?: string;
}

interface Opinion {
  id: number;
  content: string;
  name: string;
  user_id: number;
  created_at: string;
}

interface DecodedToken {
  id: number;
  role: string;
}

export const BeatDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [beatDetails, setBeatDetails] = useState<BeatDetails | null>(null);
  const [opinions, setOpinions] = useState<Opinion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isPlaying, setIsPlaying] = useState(false);
  const [_currentTime, setCurrentTime] = useState(0);
  const [selectedLicense, setSelectedLicense] = useState<License | null>(null);

  const [successMessage, setSuccessMessage] = useState('');
  const [opinionText, setOpinionText] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [decodedToken, setDecodedToken] = useState<DecodedToken | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const token = localStorage.getItem('token');
    if (token) {
      try {
        setDecodedToken(JSON.parse(atob(token.split('.')[1])));
      } catch {
        setDecodedToken(null);
      }
    }
  }, []);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const [beatResponse, opinionsResponse] = await Promise.all([
            fetch(`${baseURL}/api/beats/${id}`), 
            fetch(`${baseURL}/api/beats/${id}/opinions`)
        ]);

        if (!beatResponse.ok) throw new Error('Failed to fetch beat details');
        const beatData: BeatDetails = await beatResponse.json();
        setBeatDetails(beatData);
        document.title = beatData.title;

        if (opinionsResponse.ok) {
          const opinionsData: Opinion[] = await opinionsResponse.json();
          setOpinions(opinionsData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleAddToCart = async () => {
    if (!selectedLicense) {
      alert('Please select a license.');
      return;
    }
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(`${baseURL}/api/carts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ beat_id: id, license_id: selectedLicense.id }),
      });
      const result = await response.json();
      if (response.ok) {
        setSuccessMessage(result.message);
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        alert(result.message);
      }
    } catch (err) {
      alert('Failed to add item to cart.');
    }
  };

  const handleOpinionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      alert('You must be logged in to submit an opinion.');
      return;
    }

    try {
      const response = await fetch(`${baseURL}/api/beats/${id}/opinions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: opinionText, author: authorName.trim() || 'Anon' }),
      });
      const newOpinion = await response.json();
      if (response.ok) {
        setOpinions([newOpinion, ...opinions]);
        setOpinionText('');
        setAuthorName('');
      } else {
        alert(newOpinion.error || 'Failed to submit opinion.');
      }
    } catch (err) {
      alert('An error occurred while submitting your opinion.');
    }
  };

  const handleDeleteOpinion = async (opinionId: number) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const response = await fetch(`${baseURL}/api/beats/${id}/opinions/${opinionId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        setOpinions((prev) => prev.filter((op) => op.id !== opinionId));
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to delete opinion.');
      }
    } catch (err) {
      alert('An error occurred while deleting the opinion.');
    }
  };
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!beatDetails) return <div>Beat not found.</div>;

  return (
    <div className="beat-details-page">
      <div className="beat-details flex flex-col md:flex-row gap-8 flex-wrap justify-around lg:justify-between">
        <div className="flex flex-col gap-4 flex-grow max-w-md">
          <h1 className="text-2xl font-bold">{beatDetails.title}</h1>
          <div className="beat-info">
            <p><strong>BPM:</strong> {beatDetails.bpm}</p>
            <p><strong>Key:</strong> {beatDetails.musical_key}</p>
            <p><strong>Author:</strong> {beatDetails.authors.join(', ')}</p>
            <p><strong>Tags:</strong> {beatDetails.tags.join(', ')}</p>
          </div>
        </div>
        
        <div className="flex flex-col items-center">
            <Licenses setSelectedLicense={setSelectedLicense} />
            <div className="add-to-cart-button mt-4 w-full">
                <button onClick={handleAddToCart} className="w-full p-3 bg-secondary text-white rounded hover:bg-red-500 transition">
                Add to Cart
                </button>
                {successMessage && (
                <div className="mt-2 p-3 bg-green-200 text-green-700 rounded shadow-md animate-pop-out">
                    {successMessage}
                </div>
                )}
            </div>
        </div>

        <div className="flex justify-center items-center md:w-auto order-first md:order-none">
            <div className="beat-image bg-darkest flex justify-center items-center rounded aspect-square w-full max-w-xs md:w-80">
                <img src={beatDetails.image_url} alt={beatDetails.title} className="rounded object-contain w-full h-full" />
            </div>
        </div>
      </div>
      
      <div className="waveform-section flex flex-col items-center gap-4 p-4 mt-6">
          <button className="p-2 bg-darkes text-white rounded" onClick={() => setIsPlaying(p => !p)}>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor">
                  {isPlaying ? <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" /> : <path d="M8 5v14l11-7L8 5z" />}
              </svg>
          </button>
          <div className="w-full">
              <WaveformOverlay audioUrl={beatDetails.mp3_url} isPlaying={isPlaying} setCurrentTime={setCurrentTime} />
          </div>
      </div>
      
      {beatDetails.sample && (
          <div className="mt-4 text-secondary w-full text-xs text-center pt-6">
            <p><strong>*Ten bit jest samplowany!</strong> Flipujemy porządnie, niszowo, i nigdy nie mieliśmy żadnych problemów z prawami autorskimi, ale zawsze istnieje ten 0,1% szans, że coś się wysypie. W przypadku strajka - prosimy o kontakt</p>
          </div>
      )}

      <div className="opinions-section mt-8">
        <h2 className="text-xl font-semibold">Opinie</h2>
        {decodedToken ? (
          <form onSubmit={handleOpinionSubmit} className="mt-4 space-y-4">
            <input type="text" value={authorName} onChange={(e) => setAuthorName(e.target.value)} className="border p-2 w-full text-black" placeholder="Nazwa (opcjonalna)" />
            <textarea value={opinionText} onChange={(e) => setOpinionText(e.target.value)} className="border p-2 w-full text-black" placeholder="Napisz swoją opinię..." required />
            <button type="submit" className="p-2 bg-tertiary text-white rounded">Dodaj opinię</button>
          </form>
        ) : (
          <p className="mt-4 text-gray-400">Zaloguj się by dodać opinię.</p>
        )}
        <div className="opinions-list mt-6 space-y-4">
          {opinions.length > 0 ? opinions.map((opinion) => (
            <div key={opinion.id} className="opinion-item border-b border-gray-700 py-4">
                <div className="flex justify-between items-center text-sm text-gray-400">
                    <strong>{opinion.name}</strong>
                    <span>{new Date(opinion.created_at).toLocaleString()}</span>
                </div>
                <p className="mt-2">{opinion.content}</p>
                {(decodedToken?.id === opinion.user_id || decodedToken?.role === "admin") && (
                    <button className="text-red-500 mt-2 text-xs" onClick={() => handleDeleteOpinion(opinion.id)}>Usuń</button>
                )}
            </div>
          )) : <p>Brak opinii.</p>}
        </div>
      </div>
    </div>
  );
};