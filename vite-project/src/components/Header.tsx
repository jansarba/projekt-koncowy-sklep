import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCartIcon, CalculatorIcon, PlusCircleIcon } from '@heroicons/react/24/solid';
import { usePagination } from "../contexts/PaginationContext";


export const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { resetToFirstPage } = usePagination();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Decode the JWT
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
      console.log('Decoded token:', decodedToken);

      if (decodedToken.exp && decodedToken.exp > currentTime) {
        // Token is valid
        setIsLoggedIn(true);
        setUserName(decodedToken?.name || 'User');
        // Check if user is an admin (this will be set from the backend)
        setIsAdmin(decodedToken?.role === 'admin'); // Assuming role is 'admin'
      } else {
        // Token has expired
        localStorage.removeItem('token');
        setIsLoggedIn(false);
        setUserName('');
        setIsAdmin(false);
      }
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setUserName('');
    setIsAdmin(false);
    navigate('/login');
  };

  return (
    <div className="bg-darkest text-text p-4 sm:p-6 sticky top-0 w-full z-10 flex flex-wrap justify-between items-center gap-4">
      {/* Title */}
      <h1
        className="font-bold font-sans sm:text-3xl text-2xl cursor-pointer text-center w-full sm:w-auto"
        onClick={() => {
          if (location.pathname === "/") {
            resetToFirstPage(); // Only reset if on the home page
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
          navigate('/'); // Navigate to the home page regardless
        }}
      >
        gnusny sklep na bity
      </h1>

      {/* Buttons container */}
      <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto sm:justify-between justify-around">
        {/* Login/Register or User Info */}
        <div className="flex gap-4 justify-center items-center flex-row-reverse sm:flex-row">
          {isLoggedIn ? (
            <>
              <span className="mr-4">{userName}</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white p-2 rounded"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate('/login')}
                className="bg-secondary text-white p-2 rounded"
              >
                Login
              </button>
              <button
                onClick={() => navigate('/register')}
                className="bg-tertiary text-white p-2 rounded"
              >
                Register
              </button>
            </>
          )}
        </div>
        <div></div>
        <div></div>

        {/* Admin-specific Upload Beat button */}
        {isAdmin && (
          <button
            onClick={() => navigate('/upload')}
            className="p-2 rounded bg-purple-600 text-white flex items-center justify-center group absolute"
            aria-label="Upload Beat"
          >
            <PlusCircleIcon className="h-6 w-6" />
            <span className="absolute top-full mt-2 hidden group-hover:block bg-black text-text text-sm px-2 py-1 rounded">
              Upload Beat
            </span>
          </button>
        )}

        {/* Cart and Orders */}
        <div className="flex gap-4 justify-center items-center">
          {/* Cart button */}
          <button
            onClick={() => navigate('/cart')}
            className="p-2 rounded bg-gray-800 text-white flex items-center justify-center relative group"
            aria-label="Go to cart"
          >
            <ShoppingCartIcon className="h-6 w-6" />

            <span className="absolute top-full mt-2 hidden group-hover:block bg-black text-text text-sm px-2 py-1 rounded">
              Koszyk
            </span>
          </button>

          {/* Orders button */}
          <button
            onClick={() => navigate('/ledger')}
            className="p-2 rounded bg-gray-800 text-white flex items-center justify-center relative group"
            aria-label="Go to ledger"
          >
            <CalculatorIcon className="h-6 w-6" />

            <span className="absolute top-full mt-2 hidden group-hover:block bg-black text-text text-sm px-2 py-1 rounded">
              Zamówienia
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};