import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CartItem from './CartItem';
const baseURL = import.meta.env.VITE_API_BASE_URL;

type LicenseProps = {
  id: number;
  name: string;
  price: number;
};

type CartItemProps = {
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

const Cart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItemProps[]>([]);
  const [licenses, setLicenses] = useState<LicenseProps[]>([]);
  const [discountCode, setDiscountCode] = useState<string>('');
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [error, setError] = useState<string>('');
  const [discountApplied, setDiscountApplied] = useState<boolean>(false);

  useEffect(() => {
    const fetchLicenses = async () => {
      try {
        const response = await axios.get(`${baseURL}/api/licenses`);
        setLicenses(response.data);
      } catch (err) {
        console.error('Error fetching licenses:', err);
        setError('Failed to fetch license information');
      }
    };

    fetchLicenses();
  }, []);

  useEffect(() => {
    if (!licenses.length) return; 

    const fetchCartItems = async () => {
      ('Fetching cart items...');
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No token found');
          setError('Zaloguj się, by zobaczyć swój koszyk');
          return;
        }

        const cartResponse = await axios.get(`${baseURL}/api/carts`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const cartItems = cartResponse.data;

        const itemsWithImagesAndPrices = await Promise.all(
          cartItems.map(async (item: CartItemProps) => {
            try {
              const beatResponse = await axios.get(
                `${baseURL}/api/beats/${item.beat_id}`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );

              const license = licenses.find(license => license.id === item.license_id);
              const licensePrice = license ? parseFloat(license.price.toString()) : 0;

              return { 
                ...item, 
                image_url: beatResponse.data.image_url, 
                license_price: licensePrice 
              };
            } catch (err) {
              console.error(`Failed to fetch image or license for beat ID ${item.beat_id}`, err);
              return { ...item, image_url: '/x.jpg', license_price: 0 }; // Fallback
            }
          })
        );

        setCartItems(itemsWithImagesAndPrices);
        calculateTotalPrice(itemsWithImagesAndPrices);
      } catch (err) {
        console.error('Error fetching cart items:', err);
        setError('Failed to fetch cart items');
      }
    };

    fetchCartItems();
  }, [licenses]); 

  const calculateTotalPrice = (items: CartItemProps[]) => {
    ('Calculating total price...');
    const price = items.reduce((acc, item) => {
      const itemPrice = item.license_price || 0; // Default to 0 if no license_price
      return acc + itemPrice;
    }, 0);

    const discountMultiplier = discountCode ? 0.9 : 1; // Example: 10% discount if there's a code
    const finalPrice = price * discountMultiplier;

    setTotalPrice(finalPrice);
    localStorage.setItem('totalPrice', finalPrice.toString()); // Store price in localStorage
  };

  

  useEffect(() => {
    const storedPrice = localStorage.getItem('totalPrice');
    if (storedPrice) {
      setTotalPrice(parseFloat(storedPrice));
    }
  }, []);

  const handleRemoveItem = async (cartId: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        setError('You must be logged in to modify your cart');
        return;
      }

      await axios.delete(`${baseURL}/api/carts/${cartId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const updatedCart = cartItems.filter(item => item.cart_id !== cartId);
      setCartItems(updatedCart);
      calculateTotalPrice(updatedCart);
    } catch (err) {
      console.error('Error removing item:', err);
      setError('Failed to remove item');
    }
  };

  // Handle order placement
  const handlePlaceOrder = async () => {
    console.log('Placing order...');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        setError('You must be logged in to place an order');
        return;
      }

      const response = await axios.post(
        `${baseURL}/api/orders`,
        { discountCode },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('Order placement response:', response);
      if (response.status === 201) {
        console.log('Order placed successfully! Redirecting to order details...');
        navigate(`/order/${response.data.order.id}`); // Redirect to order details page
      }
    } catch (err) {
      console.error('Error placing order:', err);
      setError('Failed to place order');
    }
  };

  const validateDiscountCode = async (code: string) => {
    try {
      const response = await axios.get(`${baseURL}/api/discount-codes/${code}`);
      console.log('Valid discount code:', response.data);
      return response.data; // Return discount details
    } catch (err) {
      console.error('Invalid or expired discount code:', err);
      setError('Invalid or expired discount code');
      return null;
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
                {cartItems.map(item => (
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
                    <button
                      className="apply-discount-btn"
                      onClick={async () => {
                        if (discountCode) {
                          const discount = await validateDiscountCode(discountCode);
                          if (discount) {
                            setTotalPrice((prevPrice) => prevPrice * (1 - discount.discount_percentage / 100));
                            setDiscountApplied(true);
                            setError('');
                          }
                        } else {
                          setError('Please enter a discount code.');
                        }
                      }}
                    >
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