import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCartIcon, CalculatorIcon, PlusCircleIcon } from '@heroicons/react/24/solid';
import { usePagination } from '../contexts/PaginationContext';
import { useMock } from '../contexts/MockContext';
import { MOCK_USER } from '../mockData';

interface JwtPayload {
  exp: number;
  name?: string;
  role?: string;
}

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { resetToFirstPage } = usePagination();
  const { isMockMode } = useMock();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (isMockMode) {
      setIsLoggedIn(true);
      setUserName(MOCK_USER.name);
      setIsAdmin(false);
      return;
    }

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
  }, [location.pathname, isMockMode]);

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
    <header className="bg-darkest/80 backdrop-blur-md text-text sticky top-0 w-full z-10 border-b border-light/20">
      <div className="flex flex-wrap justify-between items-center gap-4 px-4 sm:px-6 py-3">
        <h1
          className="font-bold text-2xl sm:text-3xl tracking-wide cursor-pointer hover:text-tertiary transition-colors duration-200"
          onClick={handleTitleClick}
        >
          łupiebasem.pl
        </h1>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto sm:justify-between justify-around">
          <div className="flex gap-3 justify-center items-center flex-row-reverse sm:flex-row">
            {isLoggedIn ? (
              <>
                <span className="text-sm text-texthover">{userName}</span>
                <button
                  onClick={handleLogout}
                  className="text-sm text-white bg-secondary hover:bg-secondary/80 px-3 py-1.5 rounded-lg transition-all duration-200 focus:outline-none"
                >
                  Wyloguj
                </button>
                <button
                  onClick={() => navigate('/my-beats')}
                  className="text-sm text-tertiary border border-tertiary hover:bg-tertiary/10 px-3 py-1.5 rounded-lg transition-all duration-200 focus:outline-none"
                >
                  Moje bity
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="text-sm font-medium bg-secondary hover:bg-secondary/80 text-white px-4 py-1.5 rounded-lg transition-all duration-200"
                >
                  Logowanie
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="text-sm font-medium border border-tertiary text-tertiary hover:bg-tertiary/10 px-4 py-1.5 rounded-lg transition-all duration-200"
                >
                  Rejestracja
                </button>
              </>
            )}
          </div>

          {isAdmin && (
            <button
              onClick={() => navigate('/upload')}
              className="p-2 rounded-lg bg-purple-600/80 hover:bg-purple-600 text-white transition-all duration-200 relative group"
              aria-label="Dodaj bit"
            >
              <PlusCircleIcon className="h-5 w-5" />
              <span className="absolute top-full mt-2 hidden group-hover:block bg-darkest text-text text-xs px-2 py-1 rounded-lg whitespace-nowrap">
                Dodaj bit
              </span>
            </button>
          )}

          <div className="flex gap-2 justify-center items-center">
            <button
              onClick={() => navigate('/cart')}
              className="p-2 rounded-lg bg-light/50 hover:bg-light text-texthover hover:text-text transition-all duration-200 relative group"
              aria-label="Koszyk"
            >
              <ShoppingCartIcon className="h-5 w-5" />
              <span className="absolute top-full mt-2 hidden group-hover:block bg-darkest text-text text-xs px-2 py-1 rounded-lg whitespace-nowrap">
                Koszyk
              </span>
            </button>
            <button
              onClick={() => navigate('/ledger')}
              className="p-2 rounded-lg bg-light/50 hover:bg-light text-texthover hover:text-text transition-all duration-200 relative group"
              aria-label="Zamówienia"
            >
              <CalculatorIcon className="h-5 w-5" />
              <span className="absolute top-full mt-2 hidden group-hover:block bg-darkest text-text text-xs px-2 py-1 rounded-lg whitespace-nowrap right-0">
                Zamówienia
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
