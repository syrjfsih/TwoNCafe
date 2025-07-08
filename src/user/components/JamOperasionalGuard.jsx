// File: src/user/components/JamOperasionalGuard.jsx

import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase'; // Inisialisasi koneksi ke Supabase

// Komponen ini berfungsi sebagai pelindung halaman berdasarkan jam operasional
const JamOperasionalGuard = ({ children }) => {
  const [isOpen, setIsOpen] = useState(true); // Status buka/tutup berdasarkan jam operasional
  const [checking, setChecking] = useState(true); // Status pengecekan sedang berlangsung
  const location = useLocation(); // Mendapatkan path lokasi saat ini
  const navigate = useNavigate(); // Navigasi manual antar halaman

  useEffect(() => {
    // Fungsi untuk mengecek jam operasional dari database Supabase
    const cekJamOperasional = async () => {
      try {
        // Ambil data jam operasional dari tabel settings
        const { data, error } = await supabase
          .from('settings')
          .select('opening_time, closing_time')
          .eq('id', 1)
          .single();

        // Jika gagal ambil data, tampilkan error di console dan hentikan pengecekan
        if (error || !data) {
          console.error('Gagal ambil jam operasional:', error);
          setChecking(false);
          return;
        }

        // Gunakan default jika jam tidak tersedia
        const opening = data.opening_time ?? '08:00';
        const closing = data.closing_time ?? '22:00';

        // Validasi format jam
        if (!opening.includes(':') || !closing.includes(':')) {
          console.warn('Format jam tidak valid. Gunakan format HH:MM');
          setChecking(false);
          return;
        }

        // Konversi jam ke menit untuk dibandingkan
        const [openHour, openMin] = opening.split(':').map(Number);
        const [closeHour, closeMin] = closing.split(':').map(Number);

        const now = new Date();
        const nowMinutes = now.getHours() * 60 + now.getMinutes();
        const openMinutes = openHour * 60 + openMin;
        const closeMinutes = closeHour * 60 + closeMin;

        // Tentukan apakah sekarang masih dalam jam operasional
        const buka = nowMinutes >= openMinutes && nowMinutes < closeMinutes;
        setIsOpen(buka);
        setChecking(false);

        // Jika tutup dan bukan di halaman blocked, redirect ke /blocked
        if (!buka && location.pathname !== '/blocked') {
          navigate('/blocked');
        }
      } catch (err) {
        console.error('Terjadi kesalahan saat cek jam operasional:', err);
        setChecking(false);
      }
    };

    // Jalankan fungsi cek saat path halaman berubah
    cekJamOperasional();
  }, [location.pathname, navigate]);

  // Tampilkan null jika pengecekan masih berlangsung
  if (checking) return null;

  // Jika pengecekan selesai, tampilkan konten anak (children)
  return children;
};

export default JamOperasionalGuard;
