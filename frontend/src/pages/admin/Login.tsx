import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { motion } from 'motion/react';
import { siteConfig } from '@/config/siteConfig';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const login = useStore(state => state.login);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        const token = data.access;
        login(token);
        navigate('/admin/dashboard', { replace: true });
      } else {
        const data = await response.json();
        setError(data.detail || 'Invalid credentials');
      }
    } catch (err) {
      // Demo fallback for showcasing design without backend
      if (email === 'admin' && password === 'admin') {
        login('demo-token');
        navigate('/admin/dashboard', { replace: true });
        return;
      }
      setError('An error occurred during login. Is the backend running?');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 font-sans">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white border border-gray-100 shadow-xl rounded-3xl p-10 lg:p-12"
      >
        <div className="mb-10 text-center">
          <div className="flex flex-col items-center">
            <h1 className="text-3xl font-black tracking-tight text-black uppercase">
              {siteConfig.brand.name}
            </h1>
            <span className="text-[9px] tracking-[0.3em] text-zinc-400 font-bold uppercase mt-1">
              ★ COLLECTION ★
            </span>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-50">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Admin Dashboard</p>
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8 p-4 bg-red-50 text-red-600 text-xs font-medium rounded-2xl text-center"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Username</label>
            <input
              type="text"
              required
              className="w-full bg-gray-50 border border-transparent focus:border-black focus:bg-white px-6 py-4 text-sm font-medium outline-none transition-all rounded-2xl"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter username"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Password</label>
            <input
              type="password"
              required
              className="w-full bg-gray-50 border border-transparent focus:border-black focus:bg-white px-6 py-4 text-sm font-medium outline-none transition-all rounded-2xl"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-14 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-zinc-800 transition-all rounded-2xl shadow-lg shadow-black/5"
          >
            {isLoading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-10 text-center text-[10px] text-zinc-400 font-medium uppercase tracking-[0.1em]">
          Secure Access Protocol
        </p>
      </motion.div>
    </div>
  );
}
