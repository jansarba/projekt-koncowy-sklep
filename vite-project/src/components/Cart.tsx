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

  useEffect(() => {
    // Fetch licenses only once on component mount
    const fetchLicenses = async () => {
      try {
        const response = await axios.get(`${baseURL}/api/licenses`);
        setLicenses(response.data);
        console.log('Licenses fetched:', response.data);
      } catch (err) {
        console.error('Error fetching licenses:', err);
        setError('Failed to fetch license information');
      }
    };

    fetchLicenses();
  }, []);

  useEffect(() => {
    if (!licenses.length) return; // Don't fetch cart items until licenses are available

    const fetchCartItems = async () => {
      console.log('Fetching cart items...');
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No token found');
          setError('You must be logged in to view your cart');
          return;
        }

        const cartResponse = await axios.get(`${baseURL}/api/carts`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const cartItems = cartResponse.data;
        console.log('API response for cart items:', cartItems);

        // Fetch image URLs and license prices for each beat
        const itemsWithImagesAndPrices = await Promise.all(
          cartItems.map(async (item: CartItemProps) => {
            try {
              // Get the image URL for the beat
              const beatResponse = await axios.get(
                `${baseURL}/api/beats/${item.beat_id}`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );
              console.log(`Image fetched for beat ID ${item.beat_id}:`, beatResponse.data.image_url);

              // Get the price for the license and ensure it's a number
              const license = licenses.find(license => license.id === item.license_id);
              const licensePrice = license ? parseFloat(license.price.toString()) : 0;

              return { 
                ...item, 
                image_url: beatResponse.data.image_url, 
                license_price: licensePrice 
              };
            } catch (err) {
              console.error(`Failed to fetch image or license for beat ID ${item.beat_id}`, err);
              return { ...item, image_url: '/default-image.jpg', license_price: 0 }; // Fallback
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
  }, [licenses]); // Only re-fetch if licenses are available

  // Calculate the total price
  const calculateTotalPrice = (items: CartItemProps[]) => {
    console.log('Calculating total price...');
    const price = items.reduce((acc, item) => {
      const itemPrice = item.license_price || 0; // Default to 0 if no license_price
      console.log(`Adding price for item with license ID ${item.license_id}: $${itemPrice}`);
      return acc + itemPrice;
    }, 0);

    const discountMultiplier = discountCode ? 0.9 : 1; // Example: 10% discount if there's a code
    const finalPrice = price * discountMultiplier;

    console.log('Calculated total price:', finalPrice);
    setTotalPrice(finalPrice);
    localStorage.setItem('totalPrice', finalPrice.toString()); // Store price in localStorage
  };

  // Retrieve the stored price from localStorage if available
  useEffect(() => {
    const storedPrice = localStorage.getItem('totalPrice');
    if (storedPrice) {
      setTotalPrice(parseFloat(storedPrice));
    }
  }, []);

  // Handle removing item from cart
  const handleRemoveItem = async (cartId: number) => {
    console.log(`Removing item with cart_id ${cartId}...`);
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
      console.log(`Successfully removed item with cart_id ${cartId}`);
      const updatedCart = cartItems.filter(item => item.cart_id !== cartId);
      console.log('Updated cart after removal:', updatedCart);
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

  // Handle discount code change
  const handleDiscountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Changing discount code:', event.target.value);
    setDiscountCode(event.target.value);
  };

  return (
    <div className="cart-container">
      {error && <p className="error-message">{error}</p>}

      <h1>Your Cart</h1>

      {cartItems.length === 0 ? (
        <p>Your cart is empty</p>
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

            <input
              type="text"
              placeholder="Enter discount code"
              value={discountCode}
              onChange={handleDiscountChange}
              className='text-black'
            />

            <button onClick={handlePlaceOrder}>Place Order</button>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;