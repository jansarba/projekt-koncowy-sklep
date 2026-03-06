/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import WaveformOverlay from '../components/WaveformOverlay';
import { Licenses, License } from '../components/Licenses';
import { useMock } from '../contexts/MockContext';
import { mockBeatDetails, addToMockCart, getMockCart, getMockPurchasedBeats } from '../mockData';

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
  const { isMockMode } = useMock();

  const [beatInCart, setBeatInCart] = useState(false);
  const [purchasedLicensePrice, setPurchasedLicensePrice] = useState<number | null>(null);
  const [allLicenses, setAllLicenses] = useState<License[]>([]);
  const [pendingPurchasedLicenseName, setPendingPurchasedLicenseName] = useState<string | null>(null);

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

    if (isMockMode) {
      const mock = mockBeatDetails[Number(id)];
      if (mock) {
        setBeatDetails(mock);
        document.title = mock.title;
      } else {
        setError('Nie znaleziono bitu w trybie demo.');
      }
      setLoading(false);
      return;
    }

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
  }, [id, isMockMode]);

  useEffect(() => {
    if (!id) return;
    setBeatInCart(false);
    setPurchasedLicensePrice(null);
    setPendingPurchasedLicenseName(null);

    if (isMockMode) {
      const inCart = getMockCart().some(i => i.beat_id === Number(id));
      setBeatInCart(inCart);
      const purchased = getMockPurchasedBeats().find(i => i.beat_id === Number(id));
      if (purchased) setPurchasedLicensePrice(purchased.license_price);
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) return;

    const checkStatus = async () => {
      try {
        const [cartRes, ordersRes] = await Promise.all([
          fetch(`${baseURL}/api/carts`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${baseURL}/api/orders`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        if (cartRes.ok) {
          const cartItems: { beat_id: number }[] = await cartRes.json();
          setBeatInCart(cartItems.some(i => i.beat_id === Number(id)));
        }

        if (ordersRes.ok) {
          const orders: { id: number; is_paid: boolean }[] = await ordersRes.json();
          const paidOrders = orders.filter(o => o.is_paid);
          const details = await Promise.all(
            paidOrders.map(o =>
              fetch(`${baseURL}/api/orders/${o.id}`, { headers: { Authorization: `Bearer ${token}` } })
                .then(r => r.ok ? r.json() : null)
            )
          );
          for (const detail of details) {
            if (!detail?.items) continue;
            const item = detail.items.find((i: { beat_id: number; license_name: string }) => i.beat_id === Number(id));
            if (item) {
              setPendingPurchasedLicenseName(item.license_name);
              break;
            }
          }
        }
      } catch {
      }
    };

    checkStatus();
  }, [id, isMockMode]);

  useEffect(() => {
    if (!pendingPurchasedLicenseName || allLicenses.length === 0) return;
    const found = allLicenses.find(l => l.name === pendingPurchasedLicenseName);
    if (found) setPurchasedLicensePrice(parseFloat(found.price.replace(/[^0-9.]/g, '')));
  }, [pendingPurchasedLicenseName, allLicenses]);

  const handleAddToCart = async () => {
    if (!selectedLicense) {
      alert('Wybierz licencję.');
      return;
    }

    if (isMockMode) {
      if (!beatDetails) return;
      addToMockCart(
        { ...beatDetails, authors: beatDetails.authors ?? [] },
        { id: selectedLicense.id, name: selectedLicense.name, price: selectedLicense.price }
      );
      setBeatInCart(true);
      setSuccessMessage('Dodano do koszyka (demo)');
      setTimeout(() => setSuccessMessage(''), 3000);
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
        setBeatInCart(true);
        setSuccessMessage(result.message);
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        alert(result.message);
      }
    } catch (err) {
      alert('Nie udało się dodać do koszyka.');
    }
  };

  const handleOpinionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Musisz być zalogowany, aby dodać opinię.');
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
        alert(newOpinion.error || 'Nie udało się dodać opinii.');
      }
    } catch (err) {
      alert('Wystąpił błąd podczas dodawania opinii.');
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
        alert(errorData.error || 'Nie udało się usunąć opinii.');
      }
    } catch (err) {
      alert('Wystąpił błąd podczas usuwania opinii.');
    }
  };
  
  if (loading) return <div className="p-6 text-text">Wczytywanie...</div>;
  if (error) return <div className="p-6 text-secondary">Błąd: {error}</div>;
  if (!beatDetails) return <div className="p-6 text-texthover">Nie znaleziono bitu.</div>;

  return (
    <div className="beat-details-page">
      <div className="beat-details flex flex-col md:flex-row gap-8 flex-wrap justify-around lg:justify-between">
        <div className="flex flex-col gap-4 flex-grow max-w-md">
          <h1 className="text-2xl font-bold">{beatDetails.title}</h1>
          <div className="beat-info">
            <p><strong>BPM:</strong> {beatDetails.bpm}</p>
            <p><strong>Tonacja:</strong> {beatDetails.musical_key}</p>
            <p><strong>Autor:</strong> {beatDetails.authors.join(', ')}</p>
            <p><strong>Tagi:</strong> {beatDetails.tags.join(', ')}</p>
          </div>
        </div>
        
        <div className="flex flex-col items-center">
            <Licenses setSelectedLicense={setSelectedLicense} onLicensesLoaded={setAllLicenses} />
            <div className="add-to-cart-button mt-4 w-full">
                {(() => {
                  const selectedPrice = selectedLicense ? parseFloat(selectedLicense.price.replace(/[^0-9.]/g, '')) : 0;
                  const isBlockedByPurchase = purchasedLicensePrice !== null && selectedPrice <= purchasedLicensePrice;
                  const blocked = beatInCart || isBlockedByPurchase;
                  const label = beatInCart ? 'Już w koszyku' : isBlockedByPurchase ? 'Już zakupiony' : 'Dodaj do koszyka';
                  return (
                    <button
                      onClick={handleAddToCart}
                      disabled={blocked}
                      className="w-full p-3 bg-secondary text-white rounded hover:bg-secondary/80 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {label}
                    </button>
                  );
                })()}
                {successMessage && (
                <div className="mt-2 p-3 bg-darker border border-light/30 text-text rounded shadow-md animate-pop-out">
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
          <button className="p-2 bg-darkes text-white rounded border border-white/20" onClick={() => setIsPlaying(p => !p)}>
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
            <input type="text" value={authorName} onChange={(e) => setAuthorName(e.target.value)} className="bg-darker border border-light/30 p-2 w-full text-text rounded placeholder:text-lightest focus:outline-none focus:border-secondary" placeholder="Nazwa (opcjonalna)" />
            <textarea value={opinionText} onChange={(e) => setOpinionText(e.target.value)} className="bg-darker border border-light/30 p-2 w-full text-text rounded placeholder:text-lightest focus:outline-none focus:border-secondary" placeholder="Napisz swoją opinię..." required />
            <button type="submit" className="p-2 bg-tertiary text-white rounded">Dodaj opinię</button>
          </form>
        ) : (
          <p className="mt-4 text-texthover">Zaloguj się by dodać opinię.</p>
        )}
        <div className="opinions-list mt-6 space-y-4">
          {opinions.length > 0 ? opinions.map((opinion) => (
            <div key={opinion.id} className="opinion-item border-b border-light/20 py-4">
                <div className="flex justify-between items-center text-sm text-texthover">
                    <strong>{opinion.name}</strong>
                    <span>{new Date(opinion.created_at).toLocaleString()}</span>
                </div>
                <p className="mt-2">{opinion.content}</p>
                {(decodedToken?.id === opinion.user_id || decodedToken?.role === "admin") && (
                    <button className="text-secondary mt-2 text-xs hover:text-secondary/70" onClick={() => handleDeleteOpinion(opinion.id)}>Usuń</button>
                )}
            </div>
          )) : <p>Brak opinii.</p>}
        </div>
      </div>
    </div>
  );
};