// File: src/components/ModalCart.jsx

/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // Untuk animasi
import { useNavigate } from 'react-router-dom'; // Navigasi antar halaman

// Komponen ModalCart menampilkan isi keranjang sebagai sidebar geser dari kiri layar
const ModalCart = ({
  show, // Apakah modal ditampilkan
  onClose, // Fungsi untuk menutup modal
  cart, // Data keranjang belanja
  onQuantityChange, // Fungsi untuk mengubah jumlah item
  onRemoveItem, // Fungsi untuk menghapus item dari keranjang
}) => {
  const navigate = useNavigate();

  // Hitung total harga seluruh item di keranjang
  const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  // Navigasi ke halaman checkout sambil membawa data cart
  const handleGoToCheckout = () => {
    onClose(); // Tutup modal terlebih dahulu
    navigate('/checkout', { state: { cart } }); // Pindah ke halaman checkout sambil kirim data cart
  };

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Overlay hitam transparan di belakang modal */}
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black z-40"
            onClick={onClose}
          />

          {/* Sidebar modal keranjang */}
          <motion.div
            key="sidebar"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.3 }}
            className="fixed top-0 left-0 w-80 h-full bg-white z-50 shadow-lg flex flex-col p-6"
          >
            {/* Header modal */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-amber-900">Keranjang Kamu</h2>
              <button
                className="text-gray-500 hover:text-gray-700 text-xl"
                onClick={onClose} // Tombol tutup
              >
                ✕
              </button>
            </div>

            {/* Jika keranjang kosong */}
            {cart.length === 0 ? (
              <p className="text-gray-600">Keranjang masih kosong.</p>
            ) : (
              <>
                {/* Daftar isi keranjang */}
                <ul className="divide-y divide-gray-200 flex-1 overflow-y-auto mb-4">
                  {cart.map((item, index) => (
                    <li key={index} className="py-2 flex gap-3 items-center">
                      {/* Gambar menu */}
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-14 h-14 rounded object-cover border"
                      />

                      {/* Detail item */}
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{item.name}</p>

                        {/* Kontrol kuantitas */}
                        <div className="flex items-center gap-2 mt-1">
                          <button
                            onClick={() => onQuantityChange(item.id, -1)}
                            disabled={item.quantity <= 1} // Tidak bisa kurang dari 1
                            className={`px-2 rounded font-bold transition ${
                              item.quantity <= 1
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-red-200 hover:bg-red-300 text-red-700'
                            }`}
                          >
                            -
                          </button>
                          <span>{item.quantity}</span>
                          <button
                            onClick={() => onQuantityChange(item.id, 1)}
                            disabled={item.quantity >= item.stock} // Tidak bisa melebihi stok
                            className={`px-2 rounded font-bold transition ${
                              item.quantity >= item.stock
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-green-200 hover:bg-green-300 text-green-700'
                            }`}
                          >
                            +
                          </button>
                        </div>
                        <p className="text-[10px] text-gray-500 italic">
                          Stok tersedia: {item.stock}
                        </p>
                      </div>

                      {/* Harga & tombol hapus */}
                      <div className="text-right">
                        <p className="text-amber-800 font-semibold text-sm">
                          Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                        </p>
                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="text-xs text-red-600 hover:underline"
                        >
                          Hapus
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>

                {/* Total dan tombol checkout */}
                <div className="text-right font-semibold text-lg text-amber-900 mb-4">
                  Total: Rp {totalPrice.toLocaleString('id-ID')}
                </div>

                <button
                  onClick={handleGoToCheckout}
                  className="w-full bg-amber-900 hover:bg-amber-800 text-white py-2 rounded-lg font-semibold transition"
                >
                  Checkout
                </button>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ModalCart;
