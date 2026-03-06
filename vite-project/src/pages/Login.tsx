import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSidebar } from '../contexts/SidebarContext';

const baseURL = import.meta.env.VITE_API_BASE_URL;

const Login: React.FC = () => {
  const { setSidebarVisible } = useSidebar();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setSidebarVisible(false);
    return () => setSidebarVisible(true);
  }, [setSidebarVisible]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await axios.post<{ token: string }>(`${baseURL}/api/login`, { email, password });
      localStorage.setItem('token', response.data.token);
      navigate('/');
    } catch (err) {
      setError('Nieprawidłowy email lub hasło.');
      console.error(err);
    }
  };

  return (
    <div className="flex justify-center items-center h-full">
      <form className="bg-darkest p-8 rounded-md shadow-lg w-full max-w-sm" onSubmit={handleSubmit}>
        <h2 className="text-2xl font-bold mb-6 text-center">Logowanie</h2>
        {error && <p className="text-secondary bg-secondary/10 border border-secondary/30 p-3 rounded mb-4">{error}</p>}
        <div className="mb-4">
          <label className="block mb-2">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" className="w-full p-2 border rounded bg-dark text-text border-light/30 focus:outline-none focus:border-secondary" />
        </div>
        <div className="mb-6">
          <label className="block mb-2">Hasło</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" className="w-full p-2 border rounded bg-dark text-text border-light/30 focus:outline-none focus:border-secondary" />
        </div>
        <button type="submit" className="w-full bg-secondary text-white p-2 rounded hover:bg-secondary/80 transition">
          Zaloguj się
        </button>
      </form>
    </div>
  );
};

export default Login;