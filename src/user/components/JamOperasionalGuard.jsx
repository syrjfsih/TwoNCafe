// File: src/user/components/JamOperasionalGuard.jsx
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase'; // pastikan path ini sesuai

const JamOperasionalGuard = ({ children }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [checking, setChecking] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const cekJamOperasional = async () => {
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('opening_time, closing_time')
          .eq('id', 1)
          .single();

        if (error || !data) {
          console.error('Gagal ambil jam operasional:', error);
          setChecking(false);
          return;
        }

        const opening = data.opening_time ?? '08:00';
        const closing = data.closing_time ?? '22:00';

        if (!opening.includes(':') || !closing.includes(':')) {
          console.warn('Format jam tidak valid. Gunakan format HH:MM');
          setChecking(false);
          return;
        }

        const [openHour, openMin] = opening.split(':').map(Number);
        const [closeHour, closeMin] = closing.split(':').map(Number);

        const now = new Date();
        const nowMinutes = now.getHours() * 60 + now.getMinutes();
        const openMinutes = openHour * 60 + openMin;
        const closeMinutes = closeHour * 60 + closeMin;

        const buka = nowMinutes >= openMinutes && nowMinutes < closeMinutes;
        setIsOpen(buka);
        setChecking(false);

        if (!buka && location.pathname !== '/blocked') {
          navigate('/blocked');
        }
      } catch (err) {
        console.error('Terjadi kesalahan saat cek jam operasional:', err);
        setChecking(false);
      }
    };

    cekJamOperasional();
  }, [location.pathname, navigate]);

  if (checking) return null;
  return children;
};

export default JamOperasionalGuard;
