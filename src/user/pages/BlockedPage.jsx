import { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase'; // pastikan path sesuai

const BlockedPage = () => {
  const [openingTime, setOpeningTime] = useState(null);
  const [closingTime, setClosingTime] = useState(null);

  useEffect(() => {
    const fetchJamOperasional = async () => {
      const { data, error } = await supabase
        .from('settings')
        .select('opening_time, closing_time')
        .eq('id', 1)
        .single();

      if (error) {
        console.error('❌ Gagal ambil jam operasional:', error);
        return;
      }

      setOpeningTime(data?.opening_time ?? '08:00');
      setClosingTime(data?.closing_time ?? '22:00');
    };

    fetchJamOperasional();
  }, []);

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-red-100 text-red-700 px-4 text-center">
      <h1 className="text-2xl font-bold mb-2">Akses Ditolak</h1>
      <p className="text-sm mb-2">
        Silakan scan QR code dari meja untuk mengakses halaman ini.
      </p>
      <p className="text-sm">
        Atau Menunggu Jam Operasional Kami:
        {openingTime && closingTime ? (
          <span className="font-semibold"> {openingTime} - {closingTime}</span>
        ) : (
          <span className="italic text-gray-500"> memuat...</span>
        )}
      </p>
    </div>
  );
};

export default BlockedPage;
