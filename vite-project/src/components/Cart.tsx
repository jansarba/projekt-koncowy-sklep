import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CartItem from './CartItem';

const baseURL = import.meta.env.VITE_API_BASE_URL;

type License = {
  id: number;
  name: string;
  price: number;
};

type CartItemType = {
  cart_id: number;
  beat_id: number;
  beat_title: string;
  bpm: number;
  musical_key: string;
  license_id: number;
  license_name: string;
  image_url?: string;
  license_price?: number;
};

type BeatResponse = {
  image_url: string;
};

type OrderResponse = {
  order: {
    id: number;
  };
};

type DiscountCode = {
  discount_percentage: number;
};

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItemType[]>([]);
  const [licenses, setLicenses] = useState<License[]>([]);
  const [discountCode, setDiscountCode] = useState<string>('');
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [error, setError] = useState<string>('');
  const [discountApplied, setDiscountApplied] = useState<boolean>(false);

  useEffect(() => {
    const fetchLicenses = async () => {
      try {
        const response = await axios.get<License[]>(`${baseURL}/api/licenses`);
        setLicenses(response.data);
      } catch (err) {
        console.error('Error fetching licenses:', err);
        setError('Failed to fetch license information');
      }
    };
    fetchLicenses();
  }, []);

  const calculateTotalPrice = (items: CartItemType[]) => {
    const total = items.reduce((acc, item) => acc + (item.license_price || 0), 0);
    setTotalPrice(total);
    localStorage.setItem('totalPrice', total.toString());
  };

  useEffect(() => {
    if (!licenses.length) return;

    const fetchCartItems = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Zaloguj się, by zobaczyć swój koszyk');
        return;
      }

      try {
        const cartResponse = await axios.get<CartItemType[]>(`${baseURL}/api/carts`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const itemsWithDetails = await Promise.all(
          cartResponse.data.map(async (item) => {
            try {
              const beatResponse = await axios.get<BeatResponse>(`${baseURL}/api/beats/${item.beat_id}`, {
                headers: { Authorization: `Bearer ${token}` },
              });

              const license = licenses.find((l) => l.id === item.license_id);
              const licensePrice = license ? parseFloat(license.price.toString()) : 0;

              return {
                ...item,
                image_url: beatResponse.data.image_url,
                license_price: licensePrice,
              };
            } catch (err) {
              console.error(`Failed to fetch details for beat ID ${item.beat_id}`, err);
              return { ...item, image_url: '/x.jpg', license_price: 0 };
            }
          })
        );
        setCartItems(itemsWithDetails);
        calculateTotalPrice(itemsWithDetails);
      } catch (err) {
        console.error('Error fetching cart items:', err);
        setError('Failed to fetch cart items');
      }
    };
    fetchCartItems();
  }, [licenses]);

  const handleRemoveItem = async (cartId: number) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('You must be logged in to modify your cart');
      return;
    }
    try {
      await axios.delete(`${baseURL}/api/carts/${cartId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const updatedCart = cartItems.filter((item) => item.cart_id !== cartId);
      setCartItems(updatedCart);
      calculateTotalPrice(updatedCart);
    } catch (err) {
      console.error('Error removing item:', err);
      setError('Failed to remove item');
    }
  };

  const handlePlaceOrder = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('You must be logged in to place an order');
      return;
    }
    try {
      const response = await axios.post<OrderResponse>(
        `${baseURL}/api/orders`,
        { discountCode },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.status === 201) {
        navigate(`/order/${response.data.order.id}`);
      }
    } catch (err) {
      console.error('Error placing order:', err);
      setError('Failed to place order');
    }
  };

  const validateDiscountCode = async (code: string): Promise<DiscountCode | null> => {
    try {
      const response = await axios.get<DiscountCode>(`${baseURL}/api/discount-codes/${code}`);
      return response.data;
    } catch (err) {
      console.error('Invalid or expired discount code:', err);
      setError('Invalid or expired discount code');
      return null;
    }
  };

  const applyDiscount = async () => {
    if (!discountCode) {
      setError('Please enter a discount code.');
      return;
    }
    const discount = await validateDiscountCode(discountCode);
    if (discount) {
      setTotalPrice((prevPrice) => prevPrice * (1 - discount.discount_percentage / 100));
      setDiscountApplied(true);
      setError('');
    }
  };

  return (
    <div className="cart-container">
      {error && <p className="error-message">{error}</p>}
      {localStorage.getItem('token') && (
        <>
          <h1>Twój koszyk</h1>
          {cartItems.length === 0 ? (
            <p>Twój koszyk jest pusty.</p>
          ) : (
            <>
              <div className="cart-items">
                {cartItems.map((item) => (
                  <CartItem
                    key={item.cart_id}
                    cart_id={item.cart_id}
                    beat_title={item.beat_title}
                    bpm={item.bpm}
                    musical_key={item.musical_key}
                    image_url={item.image_url}
                    license_name={item.license_name}
                    license_price={item.license_price || 0}
                    onRemove={handleRemoveItem}
                  />
                ))}
              </div>
              <div className="order-summary">
                <p>Total: ${totalPrice.toFixed(2)}</p>
                {!discountApplied && (
                  <>
                    <input
                      type="text"
                      placeholder="Enter discount code"
                      value={discountCode}
                      onChange={(event) => setDiscountCode(event.target.value)}
                      className="text-black"
                    />
                    <button className="apply-discount-btn" onClick={applyDiscount}>
                      Apply Discount
                    </button>
                  </>
                )}
                {discountApplied && <p>Discount applied successfully!</p>}
                <button className="place-order-btn" onClick={handlePlaceOrder}>
                  Place Order
                </button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Cart;