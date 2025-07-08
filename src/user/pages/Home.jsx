/* eslint-disable react-hooks/exhaustive-deps */

// Import React dan hooks
import React, { useEffect, useState } from 'react';

// Import navigasi dan location untuk membaca query string
import { useLocation, useNavigate } from 'react-router-dom';

// Import framer-motion untuk animasi
import { AnimatePresence, motion } from 'framer-motion';

// Navbar khusus user
import UserNavbar from '../components/NavbarUser';

// Import koneksi supabase untuk ambil data
import { supabase } from '../../services/supabase';

// Custom hook untuk ambil query string dari URL
const useQuery = () => new URLSearchParams(useLocation().search);

const Home = () => {
  const query = useQuery(); // Ambil query dari URL (misalnya ?meja=5)
  const navigate = useNavigate(); // Navigasi antar halaman

  // State untuk menyimpan data dan status
  const [nomorMeja, setNomorMeja] = useState(() => localStorage.getItem('nomorMeja') || '');
  const [search, setSearch] = useState('');
  const [menuList, setMenuList] = useState([]);
  const [filteredMenu, setFilteredMenu] = useState([]);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [isOpen, setIsOpen] = useState(true); // Status buka tutup cafe
  const [jamOperasional, setJamOperasional] = useState('');

  // Saat pertama kali load, cek apakah query ?meja= ada
  useEffect(() => {
    const meja = query.get('meja');
    if (meja) {
      checkIfMejaAvailable(meja); // Validasi meja
    } else {
      // Hapus data meja jika tidak ada query
      localStorage.removeItem('nomorMeja');
      setNomorMeja('');
    }
  }, []);

  // Jika nomor meja tersedia dan cafe buka, ambil data menu
  useEffect(() => {
    if (nomorMeja && isOpen) {
      fetchMenu();
    }
  }, [nomorMeja, isOpen]);

  // Cek apakah saat ini masih jam operasional
  useEffect(() => {
    const cekJamOperasional = async () => {
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('opening_time, closing_time')
          .eq('id', 1)
          .single();

        if (error || !data) {
          console.error('❌ Gagal ambil data jam operasional:', error);
          return;
        }

        // Ambil jam buka dan tutup dari database
        const opening = data.opening_time ?? '08:00';
        const closing = data.closing_time ?? '22:00';

        if (!opening.includes(':') || !closing.includes(':')) {
          console.warn('❗ Format jam tidak valid');
          return;
        }

        // Konversi ke menit
        const [openHour, openMin] = opening.split(':').map(Number);
        const [closeHour, closeMin] = closing.split(':').map(Number);
        const now = new Date();
        const nowMinutes = now.getHours() * 60 + now.getMinutes();
        const openMinutes = openHour * 60 + openMin;
        const closeMinutes = closeHour * 60 + closeMin;

        // Apakah saat ini masih dalam jam buka?
        const isOpen = nowMinutes >= openMinutes && nowMinutes < closeMinutes;

        if (!isOpen) {
          navigate('/blocked'); // Jika di luar jam operasional, redirect ke halaman blokir
        }
      } catch (err) {
        console.error('🚨 Error saat cek jam operasional:', err);
      }
    };

    cekJamOperasional();
  }, []);

  // Validasi apakah meja tersedia (tidak sedang dipakai)
  const checkIfMejaAvailable = async (meja) => {
    const { data, error } = await supabase
      .from('orders')
      .select('id')
      .eq('table_number', parseInt(meja))
      .is('ended_at', null)
      .neq('status', 'selesai');

    if (error) {
      console.error('Gagal cek status meja:', error);
      return;
    }

    if (data.length > 0) {
      alert(`⚠️ Meja ${meja} sedang digunakan. Silakan scan barcode meja lain.`);
      localStorage.removeItem('nomorMeja');
      setNomorMeja('');
      navigate('/');
    } else {
      localStorage.setItem('nomorMeja', meja);
      setNomorMeja(meja);
    }
  };

  // Ambil semua menu dari database
  const fetchMenu = async () => {
    const { data, error } = await supabase
      .from('menu')
      .select('*')
      .eq('is_deleted', false);

    if (error) {
      console.error('Gagal ambil menu:', error);
      return;
    }

    setMenuList(data);
    setFilteredMenu(data);
  };

  // Saat user mengetik di pencarian
  const handleSearchChange = (e) => {
    const keyword = e.target.value;
    setSearch(keyword);
    const filtered = menuList.filter((item) =>
      item.name.toLowerCase().includes(keyword.toLowerCase())
    );
    setFilteredMenu(filtered);
  };

  // Saat user klik menu dari hasil pencarian
  const handleSelectMenu = (menu) => {
    if (!isOpen) return;
    setSelectedMenu(menu);
  };

  // Tutup modal pencarian
  const closeModal = () => {
    setSelectedMenu(null);
  };

  // Navigasi ke halaman detail menu
  const goToDetail = (id) => {
    if (!isOpen) return;
    navigate(`/menu/${id}`);
  };

  return (
    <>
      {/* Navbar atas */}
      <UserNavbar />

      {/* Hero Section */}
      <div className="w-full min-h-screen font-sans bg-white">
        <div
          className="w-full h-[500px] bg-cover bg-[position:top_10%_center] relative"
          style={{ backgroundImage: "url('/foto menu/background.jpg')" }}
        >
          {/* Overlay dan konten selamat datang */}
          <div className="bg-black bg-opacity-30 w-full h-full py-20 px-5 sm:px-8 md:px-16 lg:px-32 text-white text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 leading-tight drop-shadow-md">
              Selamat Datang di <span className="text-white">TwoNCafe!</span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl font-light">
              {nomorMeja
                ? <>Kamu sedang berada di <strong>Meja {nomorMeja}</strong></>
                : <>Silakan <strong>scan QR</strong> di meja untuk memulai</>
              }
            </p>

            {/* Info tutup operasional */}
            {!isOpen && (
              <p className="mt-4 text-sm sm:text-base text-red-400 font-medium">
                Saat ini di luar jam operasional ({jamOperasional}). Pemesanan dinonaktifkan.
              </p>
            )}

            {/* Pencarian */}
            <div className="mt-10 flex justify-center">
              <div className="bg-white rounded-full shadow-lg flex items-center px-3 py-1 w-full max-w-2xl">
                <input
                  type="text"
                  value={search}
                  onChange={handleSearchChange}
                  placeholder="Ketik Makananmu"
                  className="flex-grow p-3 rounded-full outline-none text-gray-800 text-sm sm:text-base"
                  disabled={!nomorMeja || !isOpen}
                />
                <button
                  className="bg-amber-900 hover:bg-[#452121] text-white px-6 py-2 rounded-full font-semibold text-sm sm:text-base"
                  disabled={!nomorMeja || !isOpen}
                >
                  <i className="fa fa-search mr-1"></i> Cari
                </button>
              </div>
            </div>

            {/* Hasil pencarian */}
            <AnimatePresence>
              {isOpen && search && filteredMenu.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-6 w-full max-w-3xl mx-auto bg-white bg-opacity-90 rounded-xl shadow p-4 grid grid-cols-2 sm:grid-cols-3 gap-4"
                >
                  {filteredMenu.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleSelectMenu(item)}
                      className="flex flex-col items-center text-center cursor-pointer hover:scale-105 transition-transform"
                    >
                      <img
                        src={item.image || '/foto menu/default.jpg'}
                        alt={item.name}
                        className="w-24 h-24 object-cover rounded-full border border-amber-800 shadow mb-2"
                      />
                      <p className="text-sm font-semibold text-gray-700">{item.name}</p>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Modal detail menu (klik dari hasil pencarian) */}
        <AnimatePresence>
          {isOpen && selectedMenu && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
              onClick={closeModal}
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
                transition={{ duration: 0.3 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl text-left"
              >
                <img
                  src={selectedMenu.image || '/foto menu/default.jpg'}
                  alt={selectedMenu.name}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
                <h3 className="text-xl font-bold mb-2 text-gray-800">{selectedMenu.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{selectedMenu.description || 'Tidak ada deskripsi.'}</p>
                <p className="text-lg font-semibold text-amber-800 mb-4">Rp {selectedMenu.price?.toLocaleString()}</p>
                <div className="flex justify-between">
                  <button
                    onClick={closeModal}
                    className="text-sm text-gray-500 hover:underline"
                  >
                    Tutup
                  </button>
                  <button
                    onClick={() => goToDetail(selectedMenu.id)}
                    className="bg-amber-800 hover:bg-amber-700 text-white px-4 py-2 text-sm font-semibold rounded"
                  >
                    Lihat Detail
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Daftar meja (nonaktif), hanya indikator visual */}
        <div className="py-8 px-4 sm:px-8 md:px-16 lg:px-32">
          <h2 className="text-xl font-bold mb-4 text-gray-700">Meja Tersedia</h2>
          <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-10 gap-4">
            {[...Array(30)].map((_, i) => {
              const num = (i + 1).toString();
              const isAktif = num === nomorMeja;
              return (
                <button
                  key={num}
                  disabled
                  className={`rounded-lg p-3 font-semibold text-sm transition-all duration-300 ${isAktif
                      ? 'bg-green-600 text-white cursor-default shadow-[0_0_15px_4px_rgba(34,197,94,0.7)] animate-pulse'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                >
                  Meja {num}
                </button>
              );
            })}
          </div>
        </div>

        {/* Kategori makanan */}
        <div className="py-12 px-4 sm:px-8 md:px-16 lg:px-32 bg-gray-50">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-8 justify-items-center">
            {[
              { name: "Nasi Goreng", img: "/foto menu/icon_nasi_goreng.jpg" },
              { name: "Ayam Bakar", img: "/foto menu/icon_ayam bakar.jpg" },
              { name: "Roti", img: "/foto menu/icon_roti_cokelat.jpg" },
              { name: "Mie", img: "/foto menu/icon_mie_goreng.jpg" },
              { name: "Ayam Geprek", img: "/foto menu/icon_ayam_geprek.jpg" },
              { name: "Minuman", img: "/foto menu/icon_minuman.jpg" },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full overflow-hidden border-[3px] border-[#5e2d2d] shadow-lg mb-3 transition-transform hover:scale-105">
                  <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <p className="text-sm sm:text-base font-semibold text-gray-800">{item.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
