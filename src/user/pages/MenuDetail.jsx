import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { FaArrowLeft, FaShoppingCart } from 'react-icons/fa';
import ModalCart from '../components/ModalCart';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const MenuDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [menu, setMenu] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState(() => {
    const stored = localStorage.getItem('cart');
    return stored ? JSON.parse(stored) : [];
  });
  const [showCart, setShowCart] = useState(false);

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

  if (loading) {
    return <div className="text-center py-20 text-gray-600 animate-pulse">Loading menu...</div>;
  }

  if (!menu) {
    return <div className="text-center py-20 text-red-600">Menu tidak ditemukan.</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white font-sans">
      {/* Header */}
      <div className="bg-amber-900 text-white px-4 py-4 flex items-center justify-between shadow-md sticky top-0 z-50">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 hover:text-gray-300">
          <FaArrowLeft /> <span>Kembali</span>
        </button>
        <h1 className="text-xl font-bold">Detail Menu</h1>
        <button onClick={() => setShowCart(true)} className="text-white hover:text-gray-300">
          <FaShoppingCart size={20} />
        </button>
      </div>

      {/* Konten Menu */}
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          <img
            src={menu.image || '/foto menu/default.jpg'}
            alt={menu.name}
            className="w-full h-64 sm:h-80 object-cover"
          />

          <div className="p-6 sm:p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">{menu.name}</h2>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              {menu.description || 'Tidak ada deskripsi untuk menu ini.'}
            </p>

            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold text-amber-800">
                Rp {menu.price?.toLocaleString()}
              </span>
              <button
                onClick={handleAddToCart}
                className="bg-amber-800 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-semibold shadow"
              >
                Tambah ke Keranjang
              </button>
            </div>
          </div>
        </div>
      </div>

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
