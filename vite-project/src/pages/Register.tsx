import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios, { AxiosError } from 'axios';
import { useSidebar } from '../contexts/SidebarContext';

const baseURL = import.meta.env.VITE_API_BASE_URL;

const Register: React.FC = () => {
  const { setSidebarVisible } = useSidebar();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setSidebarVisible(false);
    return () => setSidebarVisible(true);
  }, [setSidebarVisible]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!name.trim()) {
      setError('Name is required.');
      return;
    }
    try {
      await axios.post(`${baseURL}/api/register`, { name, email, password });
      navigate('/login');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const serverError = err as AxiosError<{ message?: string }>;
        setError(serverError.response?.data?.message || 'Registration failed. Please try again.');
      } else {
        setError('An unexpected error occurred.');
      }
      console.error(err);
    }
  };

  return (
    <div className="flex justify-center items-center h-full pb-36">
      <form className="bg-darkest p-8 rounded-md shadow-lg w-full max-w-sm" onSubmit={handleSubmit}>
        <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>
        {error && <p className="text-red-500 bg-red-100 border border-red-400 p-3 rounded mb-4">{error}</p>}
        <div className="mb-4">
          <label className="block mb-2">Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full p-2 border rounded bg-dark text-white border-gray-600" />
        </div>
        <div className="mb-4">
          <label className="block mb-2">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full p-2 border rounded bg-dark text-white border-gray-600" />
        </div>
        <div className="mb-4">
          <label className="block mb-2">Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full p-2 border rounded bg-dark text-white border-gray-600" />
        </div>
        <div className="mb-6">
          <label className="block mb-2">Confirm Password</label>
          <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="w-full p-2 border rounded bg-dark text-white border-gray-600" />
        </div>
        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition">
          Register
        </button>
      </form>
    </div>
  );
};

export default Register;