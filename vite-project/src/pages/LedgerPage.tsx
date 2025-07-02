import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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

  useEffect(() => {
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
        setError('Failed to fetch orders.');
        console.error(err);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className="ledger-page pb-44">
      <h1 className="text-2xl font-bold mb-4">Historia zamówień</h1>
      {error && <p className="text-red-500">{error}</p>}
      <div className="orders-list space-y-4">
        {orders.length > 0 ? (
          orders.map((order) => (
            <div
              key={order.id}
              className="order-item p-4 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors"
              onClick={() => navigate(`/order/${order.id}`)}
            >
              <div className="flex justify-between">
                <span className="font-semibold">Order #{order.id}</span>
                <span className={order.is_paid ? 'text-green-400' : 'text-yellow-400'}>{order.is_paid ? 'Paid' : 'Pending'}</span>
              </div>
              <div className="flex gap-4 mt-2 text-sm text-gray-400">
                <span>Total: ${parseFloat(order.total_price).toFixed(2)}</span>
                <span>{new Date(order.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))
        ) : (
          <p>No orders found.</p>
        )}
      </div>
    </div>
  );
};