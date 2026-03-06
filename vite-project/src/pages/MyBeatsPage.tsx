import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMock } from '../contexts/MockContext';
import { getMockPurchasedBeats } from '../mockData';

const baseURL = import.meta.env.VITE_API_BASE_URL;

type PurchasedBeat = {
  beat_id: number;
  title: string;
  bpm: number;
  musical_key: string;
  image_url: string;
  license_name: string;
  order_id: number;
};

const MyBeatsPage: React.FC = () => {
  const { isMockMode } = useMock();
  const navigate = useNavigate();
  const [beats, setBeats] = useState<PurchasedBeat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sendingFiles, setSendingFiles] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (isMockMode) {
      const purchased = getMockPurchasedBeats();
      setBeats(purchased.map(item => ({
        beat_id: item.beat_id,
        title: item.beat_title,
        bpm: item.bpm,
        musical_key: item.musical_key,
        image_url: item.image_url,
        license_name: item.license_name,
        order_id: item.order_id,
      })));
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchPurchasedBeats = async () => {
      try {
        const res = await fetch(`${baseURL}/api/orders`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Nie udało się pobrać zamówień.');
        const orders: { id: number; is_paid: boolean }[] = await res.json();
        const paidOrders = orders.filter(o => o.is_paid);

        const details = await Promise.all(
          paidOrders.map(o =>
            fetch(`${baseURL}/api/orders/${o.id}`, {
              headers: { Authorization: `Bearer ${token}` },
            }).then(r => r.ok ? r.json() : null)
          )
        );

        const beatMap = new Map<number, PurchasedBeat>();
        for (const detail of details) {
          if (!detail?.items) continue;
          for (const item of detail.items) {
            if (!beatMap.has(item.beat_id)) {
              beatMap.set(item.beat_id, {
                beat_id: item.beat_id,
                title: item.title,
                bpm: item.bpm,
                musical_key: item.musical_key,
                image_url: item.image_url,
                license_name: item.license_name,
                order_id: detail.order.id,
              });
            }
          }
        }
        setBeats(Array.from(beatMap.values()));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Wystąpił błąd.');
      } finally {
        setLoading(false);
      }
    };

    fetchPurchasedBeats();
  }, [isMockMode, navigate]);

  const handleSendFiles = async (orderId: number) => {
    if (isMockMode) {
      alert('Pliki zostałyby wysłane na Twój email. (tryb demo)');
      return;
    }
    const token = localStorage.getItem('token');
    if (!token) return;

    setSendingFiles(prev => ({ ...prev, [orderId]: true }));
    try {
      const res = await fetch(`${baseURL}/api/orders/${orderId}/send-files`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        alert('Pliki zostały wysłane na Twój email!');
      } else {
        alert('Nie udało się wysłać plików.');
      }
    } catch {
      alert('Wystąpił błąd podczas wysyłania plików.');
    } finally {
      setSendingFiles(prev => ({ ...prev, [orderId]: false }));
    }
  };

  if (loading) return <div className="p-6 text-text">Wczytywanie...</div>;
  if (error) return <div className="p-6 text-secondary">Błąd: {error}</div>;

  return (
    <div className="p-6 pb-48 text-text">
      <h1 className="text-2xl font-bold mb-6">Moje bity</h1>
      {beats.length === 0 ? (
        <p className="text-texthover">Nie masz jeszcze żadnych zakupionych bitów.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {beats.map(beat => (
            <div
              key={beat.beat_id}
              className="bg-dark rounded-xl overflow-hidden flex flex-col group hover:bg-light transition-colors duration-200 hover:shadow-lg hover:shadow-black/30"
            >
              <div
                className="relative cursor-pointer aspect-square overflow-hidden"
                onClick={() => navigate(`/beat/${beat.beat_id}`)}
              >
                <img
                  src={beat.image_url || '/default-image.jpg'}
                  alt={beat.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              </div>
              <div className="p-3 flex flex-col gap-2 flex-grow">
                <h3
                  className="font-semibold truncate cursor-pointer hover:text-tertiary transition-colors"
                  onClick={() => navigate(`/beat/${beat.beat_id}`)}
                >
                  {beat.title}
                </h3>
                <div className="flex flex-wrap gap-1">
                  <span className="bg-darkes text-texthover text-xs rounded-full px-2 py-0.5">{beat.musical_key}</span>
                  <span className="bg-darkes text-texthover text-xs rounded-full px-2 py-0.5">{beat.bpm} BPM</span>
                  <span className="bg-secondary/20 text-secondary text-xs rounded-full px-2 py-0.5">{beat.license_name}</span>
                </div>
                <button
                  onClick={() => handleSendFiles(beat.order_id)}
                  disabled={sendingFiles[beat.order_id]}
                  className="mt-auto w-full p-2 bg-secondary text-white text-sm rounded hover:bg-secondary/80 transition-colors disabled:opacity-50"
                >
                  {sendingFiles[beat.order_id] ? 'Wysyłanie...' : 'Wyślij pliki na email'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBeatsPage;
