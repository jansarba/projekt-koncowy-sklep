import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
const baseURL = import.meta.env.VITE_API_BASE_URL;

const OrderDetails = () => {
  const { id } = useParams(); // Get order ID from URL parameters
  const [order, setOrder] = useState<any>(null); // Store order data
  const [error, setError] = useState<string>(''); // Store error messages
  const [loading, setLoading] = useState<boolean>(false); // Loading state for the payment process

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        // Get the JWT token from localStorage
        const token = localStorage.getItem('token');

        if (!token) {
          setError('You must be logged in to view order details');
          return;
        }

        // Fetch order details with JWT token in the Authorization header
        const response = await axios.get(
          `${baseURL}/api/orders/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`, // Include the JWT token in the request headers
            },
          }
        );

        setOrder(response.data); // Set order data in state
      } catch (err) {
        console.error(err); // Log the error for debugging
        setError('Failed to fetch order details'); // Set error message
      }
    };

    fetchOrderDetails();
  }, [id]); // Refetch if `id` changes

  const payOrder = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You must be logged in to make a payment');
        setLoading(false);
        return;
      }
  
      // Make API call to update order status to "paid"
      const paymentResponse = await axios.post(
        `${baseURL}/api/orders/${id}/payment`,
        {
          paymentStatus: 'success',
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      if (!paymentResponse.data || paymentResponse.status !== 200) {
        throw new Error('Payment failed');
      }
  
      // Make API call to send files
      const sendFilesResponse = await axios.post(
        `${baseURL}/api/orders/${id}/send-files`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      if (sendFilesResponse.data.success || sendFilesResponse.status === 200) {
        // Update the order state to reflect the paid status
        setOrder((prevOrder: any) => ({
          ...prevOrder,
          order: { ...prevOrder.order, is_paid: true },
        }));
  
        alert('Payment successful! Files sent.');
      } else {
        throw new Error('Failed to send files');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred during payment or file sending');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="order-details">
      {error && <p className="error-message">{error}</p>} {/* Show error if any */}

      {order ? (
        <>
          <h1>Order #{order.order.id}</h1>
          <p>
            Total Price: ${order.order.total_price ? parseFloat(order.order.total_price).toFixed(2) : '0.00'}
          </p>
          <p>Status: {order.order.is_paid ? 'Paid' : 'Pending'}</p>

          {/* List the items in the order */}
          <div className="order-items">
            {Array.isArray(order.items) && order.items.length > 0 ? (
              order.items.map((item: any) => (
                <div key={item.cart_id} className="order-item flex items-center space-x-4 p-4 border-b">
                  <img
                    src={item.image_url || '/default-image.jpg'}
                    alt={item.title}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div className="item-info flex-grow">
                    <h3 className="font-semibold text-lg">{item.title}</h3>
                    <p className="text-sm">{item.license_name}</p>
                    <p className="text-sm">
                      {item.bpm} BPM | {item.musical_key}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p>No items in this order.</p>
            )}
          </div>

          {/* Add Pay button if order is not paid */}
          {!order.order.is_paid && (
            <div className="pay-button mt-4">
              <button
                onClick={payOrder}
                className="p-3 bg-green-500 text-white rounded hover:bg-green-600 transition"
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Pay and Send Files'}
              </button>
            </div>
          )}
          <div className='pb-48'>
          </div>
        </>
      ) : (
        <p>Loading order details...</p>
      )}
    </div>
  );
};

export default OrderDetails;