import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useMock } from '../contexts/MockContext';
import { getMockOrder, payMockOrder } from '../mockData';

const baseURL = import.meta.env.VITE_API_BASE_URL;

interface OrderItem {
  cart_id: number;
  title: string;
  image_url?: string;
  license_name: string;
  bpm: number;
  musical_key: string;
}

interface OrderDetails {
  id: number;
  total_price: string;
  is_paid: boolean;
}

interface OrderResponse {
  order: OrderDetails;
  items: OrderItem[];
}

const OrderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isMockMode } = useMock();
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isMockMode) {
      const mock = getMockOrder(Number(id));
      if (mock) {
        setOrder({
          order: { id: mock.id, total_price: mock.total_price, is_paid: mock.is_paid },
          items: mock.items.map((i) => ({
            cart_id: i.cart_id,
            title: i.beat_title,
            image_url: i.image_url,
            license_name: i.license_name,
            bpm: i.bpm,
            musical_key: i.musical_key,
          })),
        });
      } else {
        setError('Nie znaleziono zamówienia demo.');
      }
      return;
    }

    const fetchOrderDetails = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Musisz być zalogowany, aby zobaczyć szczegóły zamówienia.');
        return;
      }
      try {
        const response = await axios.get<OrderResponse>(`${baseURL}/api/orders/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrder(response.data);
      } catch (err) {
        setError('Nie udało się pobrać szczegółów zamówienia.');
        console.error(err);
      }
    };
    if (id) fetchOrderDetails();
  }, [id, isMockMode]);

  const handlePayment = async () => {
    if (isMockMode) {
      setLoading(true);
      // symuluj opóźnienie płatności
      await new Promise((r) => setTimeout(r, 500));
      const paid = payMockOrder(Number(id));
      if (paid) {
        setOrder((prev) => prev ? { ...prev, order: { ...prev.order, is_paid: true } } : null);
        alert('Płatność zakończona sukcesem! (tryb demo)');
      }
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('token');
    if (!token || !id) return;
    setLoading(true);
    try {
      await axios.post(`${baseURL}/api/orders/${id}/payment`, { paymentStatus: 'success' }, { headers: { Authorization: `Bearer ${token}` } });
      await axios.post(`${baseURL}/api/orders/${id}/send-files`, {}, { headers: { Authorization: `Bearer ${token}` } });

      setOrder(prev => prev ? { ...prev, order: { ...prev.order, is_paid: true } } : null);
      alert('Płatność zakończona! Pliki zostały wysłane na Twój email.');
    } catch (err) {
      setError('Wystąpił błąd podczas płatności lub wysyłania plików.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!order) return <div className="p-6 text-text">{error || 'Wczytywanie szczegółów zamówienia...'}</div>;

  return (
    <div className="p-6 pb-48 text-text">
      <h1 className="text-2xl font-bold mb-2">Zamówienie #{order.order.id}</h1>
      <p>Łączna cena: {parseFloat(order.order.total_price).toFixed(2)} zł</p>
      <p className="mb-6">Status: <span className={order.order.is_paid ? 'text-green-400' : 'text-yellow-400'}>{order.order.is_paid ? 'Opłacone' : 'Oczekujące'}</span></p>

      <div className="space-y-0 bg-dark rounded-xl overflow-hidden">
        <h2 className="text-xl font-semibold p-4 border-b border-light/20">Pozycje</h2>
        {order.items?.length > 0 ? (
          order.items.map((item) => (
            <div key={item.cart_id} className="flex items-center space-x-4 p-4 border-b border-light/20">
              <img src={item.image_url || '/default-image.jpg'} alt={item.title} className="w-20 h-20 object-cover rounded" />
              <div className="flex-grow">
                <h3 className="font-semibold text-lg">{item.title}</h3>
                <p className="text-sm">{item.license_name}</p>
                <p className="text-sm text-texthover">{item.bpm} BPM | {item.musical_key}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="p-4 text-texthover">Brak pozycji w tym zamówieniu.</p>
        )}
      </div>

      {!order.order.is_paid && (
        <div className="mt-6">
          <button onClick={handlePayment} disabled={loading} className="w-full p-3 bg-secondary text-white rounded hover:bg-secondary/80 transition-colors disabled:opacity-50">
            {loading ? 'Przetwarzanie...' : 'Opłać i odbierz pliki'}
          </button>
        </div>
      )}
    </div>
  );
};

export default OrderDetails;