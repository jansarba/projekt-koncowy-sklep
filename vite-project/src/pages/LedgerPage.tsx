import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useMock } from '../contexts/MockContext';
import { getMockOrders } from '../mockData';

const baseURL = import.meta.env.VITE_API_BASE_URL;

interface Order {
  id: number;
  total_price: string;
  is_paid: boolean;
  created_at: string;
}

export const LedgerPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();
  const { isMockMode } = useMock();

  useEffect(() => {
    if (isMockMode) {
      setOrders(getMockOrders());
      return;
    }

    const fetchOrders = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Zaloguj się, by zobaczyć historię zamówień.');
        return;
      }
      try {
        const response = await axios.get<Order[]>(`${baseURL}/api/orders`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(response.data);
      } catch (err) {
        setError('Nie udało się pobrać zamówień.');
        console.error(err);
      }
    };
    fetchOrders();
  }, [isMockMode]);

  return (
    <div className="p-6 pb-44 text-text">
      <h1 className="text-2xl font-bold mb-4">Historia zamówień</h1>
      {error && <p className="text-secondary bg-secondary/10 border border-secondary/30 p-3 rounded mb-4">{error}</p>}
      <div className="orders-list space-y-4">
        {orders.length > 0 ? (
          orders.map((order) => (
            <div
              key={order.id}
              className="order-item p-4 bg-dark rounded-lg cursor-pointer hover:bg-light transition-colors"
              onClick={() => navigate(`/order/${order.id}`)}
            >
              <div className="flex justify-between">
                <span className="font-semibold">Zamówienie #{order.id}</span>
                <span className={order.is_paid ? 'text-green-400' : 'text-yellow-400'}>{order.is_paid ? 'Opłacone' : 'Oczekujące'}</span>
              </div>
              <div className="flex gap-4 mt-2 text-sm text-texthover">
                <span>Łącznie: {parseFloat(order.total_price).toFixed(2)} zł</span>
                <span>{new Date(order.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))
        ) : (
          <p className="text-texthover">Brak zamówień.</p>
        )}
      </div>
    </div>
  );
};