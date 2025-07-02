import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCartIcon, CalculatorIcon, PlusCircleIcon } from '@heroicons/react/24/solid';
import { usePagination } from '../contexts/PaginationContext';

interface JwtPayload {
  exp: number;
  name?: string;
  role?: string;
}

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { resetToFirstPage } = usePagination();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload: JwtPayload = JSON.parse(atob(token.split('.')[1]));
        const isTokenValid = payload.exp && payload.exp * 1000 > Date.now();

        if (isTokenValid) {
          setIsLoggedIn(true);
          setUserName(payload.name || 'User');
          setIsAdmin(payload.role === 'admin');
        } else {
          localStorage.removeItem('token');
          setIsLoggedIn(false);
          setUserName('');
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Failed to decode JWT:', error);
        localStorage.removeItem('token');
        setIsLoggedIn(false);
      }
    } else {
      setIsLoggedIn(false);
    }
  }, [location.pathname]); // Re-check on navigation

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setUserName('');
    setIsAdmin(false);
    navigate('/login');
  };

  const handleTitleClick = () => {
    if (location.pathname === '/') {
      resetToFirstPage();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
    }
  };

  return (
    <header className="bg-darkest text-text p-4 sm:p-6 sticky top-0 w-full z-10 flex flex-wrap justify-between items-center gap-4">
      <h1 className="font-bold font-sans sm:text-3xl text-2xl cursor-pointer text-center w-full sm:w-auto" onClick={handleTitleClick}>
        łupiebasem.pl
      </h1>

      <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto sm:justify-between justify-around">
        <div className="flex gap-4 justify-center items-center flex-row-reverse sm:flex-row">
          {isLoggedIn ? (
            <>
              <span className="mr-4">{userName}</span>
              <button onClick={handleLogout} className="bg-red-500 text-white p-2 rounded">
                Logout
              </button>
            </>
          ) : (
            <>
              <button onClick={() => navigate('/login')} className="bg-secondary text-white p-2 rounded">
                Login
              </button>
              <button onClick={() => navigate('/register')} className="bg-tertiary text-white p-2 rounded">
                Register
              </button>
            </>
          )}
        </div>

        {isAdmin && (
          <button onClick={() => navigate('/upload')} className="p-2 rounded bg-purple-600 text-white flex items-center justify-center group" aria-label="Upload Beat">
            <PlusCircleIcon className="h-6 w-6" />
            <span className="absolute top-full mt-2 hidden group-hover:block bg-black text-text text-sm px-2 py-1 rounded">Upload Beat</span>
          </button>
        )}

        <div className="flex gap-4 justify-center items-center">
          <button onClick={() => navigate('/cart')} className="p-2 rounded bg-gray-800 text-white flex items-center justify-center relative group" aria-label="Go to cart">
            <ShoppingCartIcon className="h-6 w-6" />
            <span className="absolute top-full mt-2 hidden group-hover:block bg-black text-text text-sm px-2 py-1 rounded">Koszyk</span>
          </button>
          <button onClick={() => navigate('/ledger')} className="p-2 rounded bg-gray-800 text-white flex items-center justify-center relative group sm:mr-6" aria-label="Go to ledger">
            <CalculatorIcon className="h-6 w-6" />
            <span className="absolute top-full mt-2 hidden group-hover:block bg-black text-text text-sm px-2 py-1 rounded">Zamówienia</span>
          </button>
        </div>
      </div>
    </header>
  );
};