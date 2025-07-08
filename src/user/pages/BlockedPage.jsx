// Import useEffect dan useState dari React
import { useEffect, useState } from 'react';
// Import koneksi Supabase (pastikan path-nya benar sesuai struktur proyekmu)
import { supabase } from '../../services/supabase';

// Komponen BlockedPage: Menampilkan pesan jika user mengakses halaman di luar jam operasional atau tanpa QR
const BlockedPage = () => {
  // State untuk menyimpan jam buka dan jam tutup
  const [openingTime, setOpeningTime] = useState(null);
  const [closingTime, setClosingTime] = useState(null);

  // useEffect untuk mengambil jam operasional saat komponen pertama kali dimuat
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

      // Simpan hasilnya ke state, fallback jika data null
      setOpeningTime(data?.opening_time ?? '08:00');
      setClosingTime(data?.closing_time ?? '22:00');
    };

    fetchJamOperasional(); // Panggil fungsi ambil data jam operasional
  }, []); // Hanya dijalankan sekali di awal

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

// Ekspor komponen agar bisa digunakan di file lain
export default BlockedPage;
