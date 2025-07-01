import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { FaArrowLeft, FaShoppingCart } from 'react-icons/fa';

const MenuDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [menu, setMenu] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return <div className="text-center py-20 text-gray-600">Loading menu...</div>;
  }

  if (!menu) {
    return <div className="text-center py-20 text-red-600">Menu tidak ditemukan.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <div className="bg-amber-900 text-white px-4 py-4 flex items-center justify-between shadow">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2">
          <FaArrowLeft /> <span>Kembali</span>
        </button>
        <h1 className="text-xl font-bold">Detail Menu</h1>
        <button className="text-white">
          <FaShoppingCart size={20} />
        </button>
      </div>

      {/* Konten Menu */}
      <div className="max-w-xl mx-auto px-4 py-8">
        <img
          src={menu.image_url || '/foto menu/default.jpg'}
          alt={menu.name}
          className="w-full h-64 object-cover rounded-xl shadow"
        />

        <h2 className="mt-6 text-2xl font-bold text-gray-800">{menu.name}</h2>
        <p className="text-gray-600 text-sm mt-2 mb-4">{menu.description || 'Tidak ada deskripsi.'}</p>

        <div className="flex justify-between items-center mt-4">
          <span className="text-xl font-semibold text-amber-800">
            Rp {menu.price?.toLocaleString()}
          </span>
          <button className="bg-amber-800 hover:bg-amber-700 text-white px-6 py-2 rounded-lg font-semibold">
            Tambah ke Keranjang
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuDetail;
