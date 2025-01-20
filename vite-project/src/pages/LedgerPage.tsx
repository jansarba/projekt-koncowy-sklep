// LedgerPage.tsx
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

export const LedgerPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // Get the JWT token from localStorage
        const token = localStorage.getItem('token');

        if (!token) {
          setError('You must be logged in to view your orders');
          return;
        }

        // Fetch orders with JWT token in the Authorization header
        const response = await axios.get(`${baseURL}/api/orders`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setOrders(response.data); // Set orders in state
      } catch (err) {
        setError('Failed to fetch orders');
      }
    };

    fetchOrders();
  }, []);

  const handleOrderClick = (orderId: number) => {
      navigate(`/order/${orderId}`); // Redirect to order details page if not paid
  };

  return (
    <div className="ledger-page pb-44">
      {error && <p className="text-red-500">{error}</p>} {/* Show error if any */}

      <h1 className="text-2xl font-bold mb-4">Order Ledger</h1>

      <div className="orders-list space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="order-item p-4 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700"
            onClick={() => handleOrderClick(order.id)}
          >
            <div className="flex justify-between">
              <span className="font-semibold text-white">Order #{order.id}</span>
              <span className="text-white">
                {order.is_paid ? 'Paid' : 'Pending'}
              </span>
            </div>
            <div className="flex gap-4 mt-2 text-white">
              <span>Total: ${parseFloat(order.total_price).toFixed(2)}</span>
              <span>{new Date(order.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};