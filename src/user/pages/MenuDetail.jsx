// Import React dan hook untuk state dan efek samping
import React, { useEffect, useState } from 'react';

// Import navigasi berdasarkan parameter URL dan untuk pindah halaman
import { useParams, useNavigate } from 'react-router-dom';

// Supabase untuk mengambil data dari database
import { supabase } from '../../services/supabase';

// Icon navigasi dan keranjang
import { FaArrowLeft, FaShoppingCart } from 'react-icons/fa';

// Komponen modal keranjang belanja
import ModalCart from '../components/ModalCart';

// Toastify untuk notifikasi popup
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const MenuDetail = () => {
  const { id } = useParams(); // Ambil parameter "id" dari URL
  const navigate = useNavigate(); // Untuk navigasi ke halaman sebelumnya

  // State untuk menyimpan data menu dari Supabase
  const [menu, setMenu] = useState(null);
  const [loading, setLoading] = useState(true);

  // State untuk keranjang belanja
  const [cart, setCart] = useState(() => {
    const stored = localStorage.getItem('cart');
    return stored ? JSON.parse(stored) : [];
  });

  const [showCart, setShowCart] = useState(false); // Untuk membuka modal keranjang

  // Ambil detail menu berdasarkan ID saat pertama kali load
  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    const { data, error } = await supabase
      .from('menu')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Gagal ambil data menu:', error);
      return;
    }
    setMenu(data);
    setLoading(false);
  };

  // Fungsi menambahkan ke keranjang
  const handleAddToCart = () => {
    const exists = cart.find((item) => item.id === menu.id);
    let updatedCart;
    if (exists) {
      updatedCart = cart.map((item) =>
        item.id === menu.id ? { ...item, quantity: item.quantity + 1 } : item
      );
    } else {
      updatedCart = [...cart, { ...menu, quantity: 1 }];
    }
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    toast.success(`${menu.name} ditambahkan ke keranjang!`);
    setShowCart(true);
  };

  // Loading saat fetch menu
  if (loading) {
    return <div className="text-center py-20 text-gray-600 animate-pulse">Loading menu...</div>;
  }

  // Jika menu tidak ditemukan
  if (!menu) {
    return <div className="text-center py-20 text-red-600">Menu tidak ditemukan.</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white font-sans">
      {/* Header Navigasi */}
      <div className="bg-amber-900 text-white px-4 py-4 flex items-center justify-between shadow-md sticky top-0 z-50">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 hover:text-gray-300">
          <FaArrowLeft /> <span>Kembali</span>
        </button>
        <h1 className="text-lg sm:text-xl font-bold">Detail Menu</h1>
        <button onClick={() => setShowCart(true)} className="text-white hover:text-gray-300">
          <FaShoppingCart size={20} />
        </button>
      </div>

      {/* Konten Menu */}
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          <img
            src={menu.image || '/foto menu/default.jpg'}
            alt={menu.name}
            className="w-full max-h-[320px] object-cover"
          />

          <div className="p-5 sm:p-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">{menu.name}</h2>
            <p className="text-sm sm:text-base text-gray-600 mb-6 leading-relaxed">
              {menu.description || 'Tidak ada deskripsi untuk menu ini.'}
            </p>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <span className="text-xl sm:text-2xl font-bold text-amber-800">
                Rp {menu.price?.toLocaleString()}
              </span>
              <button
                onClick={handleAddToCart}
                className="bg-amber-800 hover:bg-amber-700 text-white w-full sm:w-auto px-6 py-3 rounded-lg font-semibold shadow"
              >
                Tambah ke Keranjang
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Keranjang Belanja */}
      <ModalCart
        show={showCart}
        onClose={() => setShowCart(false)}
        cart={cart}
        onResetCart={() => {
          setCart([]);
          localStorage.removeItem('cart');
        }}
        onQuantityChange={(id, delta) => {
          const updated = cart.map(item =>
            item.id === id ? { ...item, quantity: item.quantity + delta } : item
          ).filter(item => item.quantity > 0);
          setCart(updated);
          localStorage.setItem('cart', JSON.stringify(updated));
        }}
        onRemoveItem={(id) => {
          const updated = cart.filter(item => item.id !== id);
          setCart(updated);
          localStorage.setItem('cart', JSON.stringify(updated));
        }}
        onCheckout={() => navigate('/menu')}
      />
    </div>
  );
};

export default MenuDetail;
