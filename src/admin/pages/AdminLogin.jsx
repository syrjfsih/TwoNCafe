import { useState } from 'react';
import { supabase } from '../../services/supabase';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg('Email atau password salah!');
    } else {
      navigate('/admin/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#a83232] via-[#d1440c] to-[#f1740f]">
      <form
        onSubmit={handleLogin}
        className="bg-white rounded-xl shadow-xl px-8 py-10 w-full max-w-sm"
      >
        <h2 className="text-2xl font-bold text-center mb-6 text-[#a8440f]">
          Admin Login
        </h2>

        {errorMsg && (
          <p className="text-red-600 text-sm mb-4 text-center">{errorMsg}</p>
        )}

        <div className="mb-4">
          <label className="block text-sm font-semibold mb-1 text-gray-800">
            Email
          </label>
          <input
            type="email"
            placeholder="Masukan email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-[#a8440f] rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold mb-1 text-gray-800">
            Password
          </label>
          <input
            type="password"
            placeholder="Masukan password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-[#a8440f] rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-[#662100] hover:bg-[#ff7530] text-white py-2 rounded-md font-semibold transition"
        >
          Masuk
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;
