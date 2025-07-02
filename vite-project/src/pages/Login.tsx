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
      setError('Invalid email or password.');
      console.error(err);
    }
  };

  return (
    <div className="flex justify-center items-center h-full">
      <form className="bg-darkest p-8 rounded-md shadow-lg w-full max-w-sm" onSubmit={handleSubmit}>
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        {error && <p className="text-red-500 bg-red-100 border border-red-400 p-3 rounded mb-4">{error}</p>}
        <div className="mb-4">
          <label className="block mb-2">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" className="w-full p-2 border rounded bg-dark text-white border-gray-600" />
        </div>
        <div className="mb-6">
          <label className="block mb-2">Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" className="w-full p-2 border rounded bg-dark text-white border-gray-600" />
        </div>
        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition">
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;