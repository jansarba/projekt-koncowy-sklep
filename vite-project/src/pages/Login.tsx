import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSidebar } from '../contexts/SidebarContext';
export const baseURL = import.meta.env.VITE_API_BASE_URL;

const Login = () => {
  const { setSidebarVisible } = useSidebar();

  // Hide Sidebar for this page
    useEffect(() => {
    setSidebarVisible(false);

    return () => {
      // Optionally restore Sidebar visibility on unmount
      setSidebarVisible(true);
    };
  }, [setSidebarVisible]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    
    try {
      const response = await axios.post(`${baseURL}/api/login`, { email, password });
      localStorage.setItem('token', response.data.token);
      navigate('/');
    } catch (err) {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="flex justify-center items-center">
      <form className="bg-darkest p-6 rounded-md shadow-lg" onSubmit={handleSubmit}>
        <h2 className="text-2xl font-bold mb-4">Login</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div className="mb-4">
          <label className="block mb-2">Email</label>
          <input
            type="email"
            className="w-full p-2 border rounded bg-black"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete='email'
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2">Password</label>
          <input
            type="password"
            className="w-full p-2 border rounded bg-black"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete='current-password'
          />
        </div>
        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded mt-4">
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;