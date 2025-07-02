import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

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
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You must be logged in to view order details.');
        return;
      }
      try {
        const response = await axios.get<OrderResponse>(`${baseURL}/api/orders/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrder(response.data);
      } catch (err) {
        setError('Failed to fetch order details.');
        console.error(err);
      }
    };
    if (id) fetchOrderDetails();
  }, [id]);

  const handlePayment = async () => {
    const token = localStorage.getItem('token');
    if (!token || !id) return;
    setLoading(true);
    try {
      await axios.post(`${baseURL}/api/orders/${id}/payment`, { paymentStatus: 'success' }, { headers: { Authorization: `Bearer ${token}` } });
      await axios.post(`${baseURL}/api/orders/${id}/send-files`, {}, { headers: { Authorization: `Bearer ${token}` } });
      
      setOrder(prev => prev ? { ...prev, order: { ...prev.order, is_paid: true } } : null);
      alert('Payment successful! Your files have been sent to your email.');
    } catch (err) {
      setError('An error occurred during payment or file sending.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!order) return <p>{error || 'Loading order details...'}</p>;

  return (
    <div className="order-details pb-48">
      <h1 className="text-2xl font-bold mb-2">Order #{order.order.id}</h1>
      <p>Total Price: ${parseFloat(order.order.total_price).toFixed(2)}</p>
      <p className="mb-6">Status: <span className={order.order.is_paid ? 'text-green-400' : 'text-yellow-400'}>{order.order.is_paid ? 'Paid' : 'Pending'}</span></p>

      <div className="order-items space-y-4">
        <h2 className="text-xl font-semibold">Items</h2>
        {order.items?.length > 0 ? (
          order.items.map((item) => (
            <div key={item.cart_id} className="order-item flex items-center space-x-4 p-4 border-b border-gray-700">
              <img src={item.image_url || '/default-image.jpg'} alt={item.title} className="w-20 h-20 object-cover rounded" />
              <div className="flex-grow">
                <h3 className="font-semibold text-lg">{item.title}</h3>
                <p className="text-sm">{item.license_name}</p>
                <p className="text-sm text-gray-400">{item.bpm} BPM | {item.musical_key}</p>
              </div>
            </div>
          ))
        ) : (
          <p>No items in this order.</p>
        )}
      </div>

      {!order.order.is_paid && (
        <div className="mt-6">
          <button onClick={handlePayment} disabled={loading} className="p-3 bg-green-500 text-white rounded hover:bg-green-600 transition disabled:bg-gray-500">
            {loading ? 'Processing...' : 'Pay and Receive Files'}
          </button>
        </div>
      )}
    </div>
  );
};

export default OrderDetails;