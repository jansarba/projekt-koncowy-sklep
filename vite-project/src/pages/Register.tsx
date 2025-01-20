import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSidebar } from '../contexts/SidebarContext';
const baseURL = import.meta.env.VITE_API_BASE_URL;

const Register = () => {
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
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState(''); // Added name field
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!name) {
      setError('Name is required');
      return;
    }

    try {
      // Send name along with email and password
      await axios.post(`${baseURL}/api/register`, { email, password, name });
      navigate('/login');
    } catch (err) {
      // Display error message from server or fallback to a generic error
      console.log('Registration error:', err);
      setError(
        'Failed to register. Please try again.'
      );
    }
  };

  return (
    <div className="flex justify-center">
      <form className="bg-darkest p-6 rounded-md shadow-lg" onSubmit={handleSubmit}>
        <h2 className="text-2xl font-bold mb-4">Register</h2>
        {error && (
          <div className="text-red-500 bg-red-100 p-2 rounded mb-4">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label className="block mb-2">Name</label>
          <input
            type="text"
            className="w-full p-2 border rounded bg-black"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2">Email</label>
          <input
            type="email"
            className="w-full p-2 border rounded bg-black"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
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
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2">Confirm Password</label>
          <input
            type="password"
            className="w-full p-2 border rounded bg-black"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded mt-4 hover:bg-blue-600 transition">
          Register
        </button>
      </form>
    </div>
  );
};

export default Register;