import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CartItem from './CartItem';
import { useMock } from '../contexts/MockContext';
import { getMockCart, removeFromMockCart, placeMockOrder, type MockCartItem } from '../mockData';

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
  const { isMockMode } = useMock();
  const [cartItems, setCartItems] = useState<CartItemType[]>([]);
  const [licenses, setLicenses] = useState<License[]>([]);
  const [discountCode, setDiscountCode] = useState<string>('');
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [error, setError] = useState<string>('');
  const [discountApplied, setDiscountApplied] = useState<boolean>(false);

  // --- Mock mode cart ---
  const [mockItems, setMockItems] = useState<MockCartItem[]>([]);

  useEffect(() => {
    if (isMockMode) {
      const items = getMockCart();
      setMockItems(items);
      setTotalPrice(items.reduce((sum, i) => sum + i.license_price, 0));
      return;
    }

    const fetchLicenses = async () => {
      try {
        const response = await axios.get<License[]>(`${baseURL}/api/licenses`);
        setLicenses(response.data);
      } catch (err) {
        console.error('Error fetching licenses:', err);
        setError('Nie udało się pobrać informacji o licencjach');
      }
    };
    fetchLicenses();
  }, [isMockMode]);

  const calculateTotalPrice = (items: CartItemType[]) => {
    const total = items.reduce((acc, item) => acc + (item.license_price || 0), 0);
    setTotalPrice(total);
    localStorage.setItem('totalPrice', total.toString());
  };

  useEffect(() => {
    if (isMockMode) return;
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
        setError('Nie udało się pobrać zawartości koszyka');
      }
    };
    fetchCartItems();
  }, [licenses, isMockMode]);

  const handleRemoveItem = async (cartId: number) => {
    if (isMockMode) {
      const updated = removeFromMockCart(cartId);
      setMockItems(updated);
      setTotalPrice(updated.reduce((sum, i) => sum + i.license_price, 0));
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Musisz być zalogowany, aby zmodyfikować koszyk');
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
      setError('Nie udało się usunąć pozycji');
    }
  };

  const handlePlaceOrder = async () => {
    if (isMockMode) {
      const order = placeMockOrder();
      navigate(`/order/${order.id}`);
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Musisz być zalogowany, aby złożyć zamówienie');
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
      setError('Nie udało się złożyć zamówienia');
    }
  };

  const validateDiscountCode = async (code: string): Promise<DiscountCode | null> => {
    try {
      const response = await axios.get<DiscountCode>(`${baseURL}/api/discount-codes/${code}`);
      return response.data;
    } catch (err) {
      console.error('Invalid or expired discount code:', err);
      setError('Nieprawidłowy lub wygasły kod rabatowy');
      return null;
    }
  };

  const applyDiscount = async () => {
    if (!discountCode) {
      setError('Proszę wpisać kod rabatowy.');
      return;
    }
    const discount = await validateDiscountCode(discountCode);
    if (discount) {
      setTotalPrice((prevPrice) => prevPrice * (1 - discount.discount_percentage / 100));
      setDiscountApplied(true);
      setError('');
    }
  };

  const displayItems = isMockMode ? mockItems : cartItems;
  const showCart = isMockMode || localStorage.getItem('token');

  return (
    <div className="p-6 pb-48 text-text">
      {error && <p className="text-secondary bg-secondary/10 border border-secondary/30 p-3 rounded mb-4">{error}</p>}
      {showCart && (
        <>
          <h1 className="text-2xl font-bold mb-4">Twój koszyk</h1>
          {displayItems.length === 0 ? (
            <p className="text-texthover">Twój koszyk jest pusty.</p>
          ) : (
            <>
              <div className="divide-y divide-light/20 mb-6 bg-dark rounded-xl overflow-hidden">
                {displayItems.map((item) => (
                  <CartItem
                    key={item.cart_id}
                    cart_id={item.cart_id}
                    beat_title={isMockMode ? (item as MockCartItem).beat_title : (item as CartItemType).beat_title}
                    bpm={item.bpm}
                    musical_key={item.musical_key}
                    image_url={item.image_url}
                    license_name={isMockMode ? (item as MockCartItem).license_name : (item as CartItemType).license_name}
                    license_price={isMockMode ? (item as MockCartItem).license_price : ((item as CartItemType).license_price || 0)}
                    onRemove={handleRemoveItem}
                  />
                ))}
              </div>
              <div className="mt-6 bg-dark rounded-xl p-4 space-y-3">
                <p className="text-lg font-semibold">Łącznie: {totalPrice.toFixed(2)} zł</p>
                {!discountApplied && !isMockMode && (
                  <>
                    <input
                      type="text"
                      placeholder="Wpisz kod rabatowy"
                      value={discountCode}
                      onChange={(event) => setDiscountCode(event.target.value)}
                      className="w-full p-2 bg-darkest border border-light/30 rounded text-text placeholder:text-lightest focus:outline-none focus:border-secondary"
                    />
                    <button className="px-4 py-2 bg-light text-text rounded hover:bg-lighter transition-colors" onClick={applyDiscount}>
                      Zastosuj rabat
                    </button>
                  </>
                )}
                {discountApplied && <p className="text-green-400">Rabat zastosowany!</p>}
                <button className="w-full p-3 bg-secondary text-white rounded hover:bg-secondary/80 transition-colors" onClick={handlePlaceOrder}>
                  Złóż zamówienie
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