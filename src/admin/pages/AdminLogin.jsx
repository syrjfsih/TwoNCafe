// File: src/admin/pages/AdminLogin.jsx

import { useState } from 'react';
import { supabase } from '../../services/supabase';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
  // State untuk menyimpan input email & password
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const navigate = useNavigate();

  // Fungsi login saat tombol diklik
  const handleLogin = async (e) => {
    e.preventDefault();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg('❌ Email atau password salah!');
    } else {
      navigate('/admin/dashboard'); // Arahkan ke dashboard setelah login berhasil
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-[#4b1d13] via-[#7b2b17] to-[#fc7a1e] px-4">
      <form
        onSubmit={handleLogin}
        className="bg-white w-full max-w-sm sm:max-w-md rounded-2xl shadow-2xl px-8 py-10 space-y-6"
      >
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#702F25] mb-2">
            Login Admin
          </h1>
          <p className="text-sm text-gray-600">
            Silakan masuk untuk mengelola TwoNCafe
          </p>
        </div>

        {/* Notifikasi Error Login */}
        {errorMsg && (
          <div className="bg-red-100 text-red-700 text-sm px-4 py-2 rounded-md text-center">
            {errorMsg}
          </div>
        )}

        {/* Input Email */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            placeholder="admin@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
            required
          />
        </div>

        {/* Input Password */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
            required
          />
        </div>

        {/* Tombol Submit */}
        <button
          type="submit"
          className="w-full bg-[#702F25] hover:bg-[#5a241d] transition text-white font-semibold py-2 rounded-lg shadow-lg"
        >
          Masuk
        </button>

        {/* Footer kecil */}
        <p className="text-xs text-gray-400 text-center">
          © {new Date().getFullYear()} TwoNCafe Admin Panel
        </p>
      </form>
    </div>
  );
};

export default AdminLogin;
