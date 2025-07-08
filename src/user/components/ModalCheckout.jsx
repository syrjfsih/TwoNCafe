// File: src/components/ModalCheckout.jsx

// Import React dan hook bawaan
import React, { useState, useEffect } from 'react';

// Import animasi dari framer-motion
import { motion, AnimatePresence } from 'framer-motion';

// Import notifikasi popup
import { toast } from 'react-toastify';

// Navigasi halaman
import { useNavigate } from 'react-router-dom';

// Import ikon
import { FaMoneyBillWave, FaQrcode } from 'react-icons/fa';

// Import koneksi supabase
import { supabase } from '../../services/supabase';

// Komponen modal checkout
const ModalCheckout = ({ show, onClose, cart = [], onResetCart = () => {} }) => {
  const navigate = useNavigate();

  // State untuk mengatur tahapan step checkout
  const [step, setStep] = useState('pilihan'); // pilihan → data → pembayaran → struk

  // Data pemesan
  const [name, setName] = useState('');
  const [table, setTable] = useState('');
  const [type, setType] = useState('');
  const [method, setMethod] = useState('');
  const [error, setError] = useState('');
  const [checkingTable, setCheckingTable] = useState(false);

  // Hitung total harga dari isi keranjang
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Ambil nomor meja dari URL saat komponen pertama kali muncul
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mejaFromURL = params.get('meja');
    if (mejaFromURL) {
      setTable(mejaFromURL);
      localStorage.setItem('nomorMeja', mejaFromURL);
    } else {
      setTable('');
      localStorage.removeItem('nomorMeja');
    }
  }, []);

  // Ambil meja yang terkunci dari localStorage
  const lockedTable = localStorage.getItem('nomorMeja');
  const isLocked = !!lockedTable;

  // Pilih tipe pemesanan (dine in / takeaway)
  const handleSelectType = (selected) => {
    setType(selected);
    setStep('data');
  };

  // Validasi input nama & meja serta cek apakah meja tersedia
  const handleInputSubmit = async () => {
    const currentTable = localStorage.getItem('nomorMeja');
    setTable(currentTable);

    if (!name.trim() || !currentTable) {
      setError('Nama dan nomor meja wajib diisi.');
      return;
    }

    setError('');
    setCheckingTable(true);

    // Cek apakah ada pesanan aktif di meja tsb
    const { data, error: fetchError } = await supabase
      .from('orders')
      .select('id')
      .eq('table_number', parseInt(currentTable))
      .is('ended_at', null);

    setCheckingTable(false);

    if (fetchError) {
      console.error(fetchError);
      setError('Terjadi kesalahan saat mengecek nomor meja.');
      return;
    }

    if (data.length > 0) {
      setError('Nomor meja sudah digunakan hari ini.');
      return;
    }

    // Lanjut ke step pembayaran jika valid
    setStep('pembayaran');
  };

  // Pilih metode pembayaran
  const handlePayment = (m) => {
    setMethod(m);
    setStep('struk');
  };

  // Simpan semua data pesanan ke database Supabase
  const handleConfirm = async () => {
    const currentTable = localStorage.getItem('nomorMeja');
    const parsedTable = parseInt(currentTable);

    if (!parsedTable || isNaN(parsedTable)) {
      toast.error('Nomor meja tidak valid.');
      return;
    }

    // 1. Simpan order utama
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        name,
        table_number: parsedTable,
        order_type: type,
        payment_method: method,
        total,
        created_at: new Date().toISOString(),
        status: 'menunggu',
        ended_at: null
      })
      .select()
      .single();

    if (orderError) {
      console.error(orderError);
      toast.error('Gagal menyimpan pesanan.');
      return;
    }

    // 2. Simpan item-item pesanan
    const itemsToInsert = cart.map((item) => ({
      order_id: orderData.id,
      menu_id: item.id,
      quantity: item.quantity,
      price: item.price,
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(itemsToInsert);
    if (itemsError) {
      console.error(itemsError);
      toast.error('Gagal menyimpan detail pesanan.');
      return;
    }

    // 3. Update stok menu
    for (let item of cart) {
      const { error: stockError } = await supabase
        .from('menu')
        .update({ stock: item.stock - item.quantity })
        .eq('id', item.id);

      if (stockError) {
        console.error(stockError);
        toast.error(`Gagal mengurangi stok untuk ${item.name}`);
        return;
      }
    }

    // 4. Reset data & arahkan user ke halaman status
    localStorage.removeItem('nomorMeja');
    onClose();
    onResetCart();
    toast.success('✅ Pesanan berhasil dikonfirmasi!');

    setTimeout(() => {
      navigate(`/status?nama=${encodeURIComponent(name)}&meja=${parsedTable}`, {
        state: { type, method, cart, total }
      });
    }, 300);
  };

  // Tampilan UI sesuai step (pilihan → data → pembayaran → struk)
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md text-center relative"
          >
            <button
              className="absolute top-3 right-4 text-gray-500 hover:text-gray-700"
              onClick={onClose}
            >
              ✕
            </button>

            {/* === Step 1: Pilih Dine In atau Takeaway === */}
            {step === 'pilihan' && (
              <>
                <h2 className="text-xl font-bold text-amber-900 mb-6">Makan disini atau bawa pulang?</h2>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => handleSelectType('takeaway')}
                    className="flex flex-col items-center bg-gray-100 hover:bg-gray-200 py-4 rounded-xl shadow-sm transition"
                  >
                    <img src="/foto-icon/take-away.png" alt="Take Away" className="w-12 h-12 mb-2" />
                    <span className="text-sm font-medium text-amber-900">Take Away</span>
                  </button>
                  <button
                    onClick={() => handleSelectType('dinein')}
                    className="flex flex-col items-center bg-gray-100 hover:bg-gray-200 py-4 rounded-xl shadow-sm transition"
                  >
                    <img src="/foto-icon/dine-in.png" alt="Dine In" className="w-12 h-12 mb-2" />
                    <span className="text-sm font-medium text-amber-900">Dine In</span>
                  </button>
                </div>
              </>
            )}

            {/* === Step 2: Form Nama & Pilih Meja === */}
            {step === 'data' && (
              <>
                <h2 className="text-xl font-bold mb-4 text-amber-900">Data Pemesan</h2>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama lengkap"
                  className="w-full border px-3 py-2 mb-4 rounded-lg text-sm"
                />
                <p className="text-left text-sm mb-1 font-medium text-gray-700">Nomor Meja:</p>
                <div className="grid grid-cols-5 gap-2 mb-4">
                  {Array.from({ length: 30 }, (_, i) => {
                    const no = (i + 1).toString();
                    const selected = table === no;
                    const disabled = isLocked && no !== lockedTable;

                    return (
                      <button
                        key={no}
                        disabled={disabled}
                        className={`py-2 rounded-lg text-sm font-semibold border transition text-center
                          ${selected ? 'bg-amber-800 text-white border-amber-800' : ''}
                          ${disabled ? 'bg-gray-200 text-gray-400 border-gray-200 cursor-not-allowed' : ''}
                          ${!selected && !disabled ? 'bg-white text-amber-900 border-gray-300 hover:border-amber-500' : ''}
                        `}
                      >
                        Meja {no}
                      </button>
                    );
                  })}
                </div>
                {checkingTable && <p className="text-gray-500 text-sm mb-2">Mengecek ketersediaan meja...</p>}
                {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
                <div className="flex justify-end gap-3">
                  <button onClick={onClose} className="text-sm text-gray-600 hover:underline">Batal</button>
                  <button onClick={handleInputSubmit} className="bg-amber-900 hover:bg-amber-800 text-white px-4 py-2 rounded-lg text-sm font-semibold">Lanjut</button>
                </div>
              </>
            )}

            {/* === Step 3: Pilih Metode Pembayaran === */}
            {step === 'pembayaran' && (
              <>
                <h2 className="text-lg sm:text-xl font-bold text-amber-900 mb-4">Pilih Metode Pembayaran</h2>
                <p className="text-sm text-gray-700 mb-4">
                  Total: <span className="text-amber-800 font-semibold">Rp {total.toLocaleString('id-ID')}</span>
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => handlePayment('tunai')}
                    className="flex flex-col items-center bg-gray-100 hover:bg-gray-200 py-4 rounded-xl shadow-sm transition"
                  >
                    <FaMoneyBillWave className="text-2xl text-amber-800 mb-2" />
                    <span className="text-sm font-medium text-amber-900">Tunai</span>
                  </button>
                  <button
                    disabled
                    className="flex flex-col items-center bg-gray-200 text-gray-400 py-4 rounded-xl shadow-sm cursor-not-allowed"
                  >
                    <FaQrcode className="text-2xl mb-2" />
                    <span className="text-sm font-medium">QRIS (Segera hadir)</span>
                  </button>
                </div>
              </>
            )}

            {/* === Step 4: Ringkasan & Konfirmasi === */}
            {step === 'struk' && (
              <>
                <h2 className="text-xl font-bold text-amber-900 mb-4">Ringkasan Pesanan</h2>
                <div className="text-sm text-left text-gray-800 mb-2">
                  <p><strong>Nama:</strong> {name}</p>
                  <p><strong>No Meja:</strong> {table}</p>
                  <p><strong>Tipe:</strong> {type === 'dinein' ? 'Dine In' : 'Take Away'}</p>
                  <p><strong>Metode:</strong> {method === 'qris' ? 'QRIS' : 'Tunai'}</p>
                </div>
                <div className="border-t border-gray-200 mt-3 pt-3 text-sm text-left">
                  {cart.map((item, i) => (
                    <div key={i} className="flex justify-between mb-1">
                      <span>{item.name} x {item.quantity}</span>
                      <span>Rp {(item.price * item.quantity).toLocaleString('id-ID')}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold mt-2">
                    <span>Total</span>
                    <span className="text-amber-800">Rp {total.toLocaleString('id-ID')}</span>
                  </div>
                </div>
                <div className="mt-6 text-center">
                  <button
                    onClick={handleConfirm}
                    className="bg-amber-900 hover:bg-amber-800 text-white px-4 py-2 rounded-lg text-sm font-semibold"
                  >
                    Konfirmasi Pesanan
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ModalCheckout;