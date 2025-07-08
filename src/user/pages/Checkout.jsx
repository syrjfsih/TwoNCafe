// File: src/user/pages/Checkout.jsx

// Import React dan hooks useEffect, useState untuk mengatur state dan efek samping
import React, { useEffect, useState } from 'react';

// Import hooks dari react-router-dom untuk navigasi dan mengambil data dari URL
import { useLocation, useNavigate } from 'react-router-dom';

// Import icon untuk visualisasi metode pembayaran
import { FaMoneyBillWave, FaQrcode } from 'react-icons/fa';

// Import toastify untuk menampilkan notifikasi
import { toast } from 'react-toastify';

// Import koneksi ke Supabase (database)
import { supabase } from '../../services/supabase';

// Komponen utama Checkout
const Checkout = () => {
  // Gunakan lokasi saat ini (untuk ambil state dari halaman sebelumnya)
  const location = useLocation();

  // Navigasi untuk berpindah halaman setelah checkout
  const navigate = useNavigate();

  // Ambil data keranjang dari state lokasi (jika tidak ada, default [])
  const { cart = [] } = location.state || {};

  // State untuk data user dan pilihan mereka
  const [name, setName] = useState('');
  const [table, setTable] = useState('');
  const [type, setType] = useState(''); // dinein / takeaway
  const [method, setMethod] = useState(''); // tunai / qris
  const [activeTables, setActiveTables] = useState([]); // Daftar meja yang sedang digunakan

  // Hitung total harga dari semua item di keranjang
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Ambil nomor meja yang tersimpan di localStorage (hasil dari QR scan)
  const lockedTable = localStorage.getItem('nomorMeja');
  const isLocked = !!lockedTable; // Apakah meja terkunci (sudah diset sebelumnya)

  // Saat komponen pertama kali dimuat
  useEffect(() => {
    const mejaFromURL = new URLSearchParams(window.location.search).get('meja');
    if (mejaFromURL) {
      setTable(mejaFromURL); // Set meja dari query string
      localStorage.setItem('nomorMeja', mejaFromURL); // Simpan di localStorage
    }
    fetchActiveTables(); // Ambil daftar meja aktif
  }, []);

  // Jika table berubah, update URL agar tetap sync
  useEffect(() => {
    if (table) {
      const url = new URL(window.location);
      url.searchParams.set('meja', table);
      window.history.replaceState({}, '', url); // Ganti URL tanpa reload
    }
  }, [table]);

  // Fungsi untuk mengambil semua meja yang sedang digunakan (belum selesai)
  const fetchActiveTables = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('table_number')
      .is('ended_at', null); // Pesanan yang belum selesai (belum ada ended_at)

    if (!error && data) {
      const aktif = [...new Set(data.map((d) => String(d.table_number)))]; // Ambil hanya yang unik
      setActiveTables(aktif);
    }
  };

  // Fungsi utama saat user menekan tombol Checkout
  const handleCheckout = async () => {
    const finalTable = localStorage.getItem('nomorMeja'); // Ambil dari localStorage (pastikan tetap konsisten)

    // Validasi input user
    if (!name.trim() || !finalTable || !type || !method) {
      toast.error('Lengkapi semua data terlebih dahulu.');
      return;
    }

    // Pastikan nomor meja valid (angka)
    const parsedTable = parseInt(finalTable);
    if (!parsedTable || isNaN(parsedTable)) {
      toast.error('Nomor meja tidak valid.');
      return;
    }

    // Simpan pesanan ke tabel `orders`
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
      toast.error('Gagal menyimpan pesanan.');
      return;
    }

    // Simpan item-item pesanan ke tabel `order_items`
    const itemsToInsert = cart.map((item) => ({
      order_id: orderData.id,
      menu_id: item.id,
      quantity: item.quantity,
      price: item.price,
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(itemsToInsert);
    if (itemsError) {
      toast.error('Gagal menyimpan detail pesanan.');
      return;
    }

    // Update stok menu setelah dipesan
    for (let item of cart) {
      await supabase
        .from('menu')
        .update({ stock: item.stock - item.quantity })
        .eq('id', item.id);
    }

    // Bersihkan nomor meja dari localStorage setelah checkout berhasil
    localStorage.removeItem('nomorMeja');

    // Tampilkan notifikasi sukses dan redirect ke halaman status
    toast.success('✅ Pesanan berhasil dikonfirmasi!');
    navigate(`/status?nama=${encodeURIComponent(name)}&meja=${parsedTable}`, {
      state: { type, method, cart, total }
    });
  };

  // Tampilan UI checkout
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-amber-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto bg-white rounded-xl shadow-2xl p-8 border border-amber-200">
        <h2 className="text-xl font-bold text-amber-900 mb-6 text-center">Checkout Pesanan</h2>

        {/* Input Nama */}
        <label className="block text-sm font-medium text-gray-700">Nama Pemesan</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Masukkan nama lengkap"
          className="w-full border px-3 py-2 rounded-lg text-sm mb-4 bg-gray-50"
        />

        {/* Pilihan Nomor Meja */}
        <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Meja</label>
        <div className="grid grid-cols-5 gap-2 mb-4">
          {Array.from({ length: 30 }, (_, i) => {
            const no = (i + 1).toString();
            const selected = table === no;
            const isActive = activeTables.includes(no);
            const isCurrent = lockedTable === no;

            return (
              <button
                key={no}
                disabled={!isCurrent}
                className={`py-2 text-xs rounded font-semibold border transition duration-200
                  ${isCurrent ? 'bg-amber-800 text-white border-amber-800' : ''}
                  ${isActive && !isCurrent ? 'bg-amber-300 text-white border-amber-300 cursor-not-allowed' : ''}
                  ${!selected && !isActive && !isCurrent ? 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed' : ''}
                  ${selected && !isCurrent ? 'bg-amber-600 text-white border-amber-600' : ''}`}
              >
                Meja {no}
              </button>
            );
          })}
        </div>

        {/* Pilih Tipe Pemesanan */}
        <label className="block text-sm font-medium text-gray-700 mb-1">Tipe Pemesanan</label>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <button
            onClick={() => setType('takeaway')}
            className={`p-4 rounded-lg shadow text-center border transition hover:scale-105 flex flex-col items-center
              ${type === 'takeaway' ? 'bg-amber-800 text-white border-amber-800' : 'bg-white text-amber-900 border-amber-300'}`}
          >
            <img
              src="/foto-icon/take-away.png"
              alt="Take Away"
              className={`w-8 h-8 mx-auto mb-1 transition ${type === 'takeaway' ? 'brightness-0 invert' : ''}`}
            />
            Take Away
          </button>
          <button
            onClick={() => setType('dinein')}
            className={`p-4 rounded-lg shadow text-center border transition hover:scale-105 flex flex-col items-center
              ${type === 'dinein' ? 'bg-amber-800 text-white border-amber-800' : 'bg-white text-amber-900 border-amber-300'}`}
          >
            <img
              src="/foto-icon/dine-in.png"
              alt="Dine In"
              className={`w-8 h-8 mx-auto mb-1 transition ${type === 'dinein' ? 'brightness-0 invert' : ''}`}
            />
            Dine In
          </button>
        </div>

        {/* Pilih Metode Pembayaran */}
        <label className="block text-sm font-medium text-gray-700 mb-1">Metode Pembayaran</label>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => setMethod('tunai')}
            className={`p-4 rounded-lg shadow text-center border transition hover:scale-105 flex flex-col items-center
              ${method === 'tunai' ? 'bg-amber-800 text-white border-amber-800' : 'bg-white text-amber-900 border-amber-300'}`}
          >
            <FaMoneyBillWave className="text-xl mb-1" />
            Bayar Tunai
          </button>
          <button
            disabled
            onClick={() => toast.info('💡 Metode QRIS belum tersedia.')}
            className="p-4 rounded-lg shadow text-center border bg-gray-100 text-gray-400 border-gray-300 flex flex-col items-center cursor-not-allowed"
          >
            <FaQrcode className="text-xl mb-1" />
            QRIS (Segera Hadir)
          </button>
        </div>

        {/* Tombol Checkout */}
        <button
          onClick={handleCheckout}
          className="w-full bg-amber-900 hover:bg-amber-800 text-white py-3 rounded-lg font-bold transition"
        >
          Checkout Sekarang
        </button>
      </div>
    </div>
  );
};

export default Checkout;
