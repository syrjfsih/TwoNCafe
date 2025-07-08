// File: src/user/pages/OrderStatus.jsx

// Import React dan hook state/effect
import React, { useState, useEffect } from 'react';

// Import untuk mengambil query string dari URL
import { useLocation } from 'react-router-dom';

// Import koneksi ke Supabase
import { supabase } from '../../services/supabase';

// Navbar khusus user
import UserNavbar from '../components/NavbarUser';

// Icon status
import { FaClock, FaCheckCircle, FaSpinner } from 'react-icons/fa';

// Komponen badge status (menunggu, diproses, selesai)
const StatusBadge = ({ status }) => {
  let color = 'text-yellow-400';
  let icon = <FaClock />;

  if (status?.toLowerCase() === 'diproses') {
    color = 'text-blue-400';
    icon = <FaSpinner className="animate-spin" />;
  } else if (status?.toLowerCase() === 'selesai') {
    color = 'text-green-600';
    icon = <FaCheckCircle />;
  }

  return (
    <span className={`flex items-center gap-2 px-3 py-1 text-sm rounded-full border ${color} border-current font-semibold`}>
      {icon}
      {status?.charAt(0).toUpperCase() + status?.slice(1)}
    </span>
  );
};

// Fungsi untuk menampilkan pesan berdasarkan status pesanan
const getStatusMessage = (status) => {
  const s = status?.toLowerCase();
  if (s === 'diproses') return '✅ Pembayaran Berhasil! Pesananmu sedang kami proses, Mohon menunggu.';
  if (s === 'selesai') return '🎉 Pesananmu telah selesai. Selamat menikmati!';
  return '💸 Silakan bayar ke kasir agar pesananmu segera diproses.';
};

// Fungsi untuk menentukan gambar berdasarkan status
const getStatusImage = (status) => {
  const s = status?.toLowerCase();
  if (s === 'diproses') return '/foto-icon/happy.png';
  if (s === 'selesai') return '/foto-icon/done.png';
  return '/foto-icon/succes.png';
};

// Komponen utama OrderStatus
const OrderStatus = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const namaQuery = params.get('nama') || '';
  const mejaQuery = params.get('meja') || '';

  // State input nama dan meja
  const [name, setName] = useState(namaQuery);
  const [table, setTable] = useState(mejaQuery);

  // State untuk menyimpan pesanan dari Supabase
  const [order, setOrder] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fungsi mengambil data pesanan berdasarkan nama dan nomor meja
  const fetchOrder = async () => {
    if (!name.trim() || !table.trim()) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*, menu:menu_id(name))') // Ambil order_items dan nama menu
      .ilike('name', name.trim())
      .eq('table_number', parseInt(table))
      .order('created_at', { ascending: false }) // Urutkan dari terbaru
      .limit(1)
      .single(); // Ambil satu data saja (terbaru)

    if (error || !data) {
      setOrder(null);
      setNotFound(true);
    } else {
      setOrder(data);
      setNotFound(false);
    }

    setLoading(false);
  };

  // Fetch data saat nama & meja valid, dan refresh otomatis tiap 10 detik
  useEffect(() => {
    if (name && table) fetchOrder();
    const interval = setInterval(fetchOrder, 10000);
    return () => clearInterval(interval);
  }, [name, table]);

  return (
    <>
      <UserNavbar />

      {/* Container utama */}
      <main className="min-h-screen bg-amber-50 py-12 px-4 sm:px-8 md:px-20 lg:px-40">
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-amber-900 mb-8">
          Status Pesananmu
        </h1>

        {/* Form input manual jika tidak ada query di URL */}
        {!namaQuery || !mejaQuery ? (
          <div className="max-w-md mx-auto space-y-4 mb-6">
            <input
              type="text"
              placeholder="Nama Pemesan"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border rounded-md shadow-sm focus:ring focus:ring-amber-300"
            />
            <input
              type="number"
              placeholder="Nomor Meja"
              value={table}
              onChange={(e) => setTable(e.target.value)}
              className="w-full px-4 py-2 border rounded-md shadow-sm"
            />
            <button
              onClick={fetchOrder}
              className="w-full bg-amber-900 text-white py-2 rounded-md hover:bg-amber-800 transition"
            >
              Cek Status
            </button>
          </div>

        // Tampilkan loading saat mengambil data
        ) : loading ? (
          <div className="text-center text-gray-500 font-medium mt-6">
            ⏳ Memuat pesanan...
          </div>

        // Jika tidak ditemukan
        ) : notFound ? (
          <div className="text-center text-yellow-700 font-medium mt-6">
            ⚠️ Tidak ada pesanan ditemukan.
          </div>

        // Jika data ditemukan
        ) : (
          <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-lg border border-amber-200 space-y-6">

            {/* 🎉 Section Status Dinamis */}
            <div className="text-center">
              <img
                src={getStatusImage(order.status)}
                alt="Status Ilustrasi"
                className="w-24 mx-auto mb-4"
              />
              <h2 className="text-xl font-bold text-amber-900">Pesanan #{order.id.slice(0, 8)}</h2>
              <p className="text-sm text-gray-700 mt-1">
                {getStatusMessage(order.status)}
              </p>
            </div>

            {/* 🧾 Ringkasan waktu & badge status */}
            <div className="flex justify-between items-center border-b pb-2">
              <div>
                <p className="text-sm text-gray-600">
                  Dibuat: {new Date(order.created_at).toLocaleString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <StatusBadge status={order.status || 'menunggu'} />
            </div>

            {/* 🧍 Info Pemesan */}
            <div className="text-sm text-gray-800 space-y-1">
              <p><span className="font-semibold">Nama Pemesan:</span> {order.name}</p>
              <p><span className="font-semibold">Meja:</span> {order.table_number}</p>
              <p><span className="font-semibold">Metode Pembayaran:</span> {order.payment_method}</p>
            </div>

            {/* 🍽️ Detail Pesanan */}
            <div>
              <p className="font-semibold text-amber-900 mb-2">Rincian Pesanan:</p>
              <ul className="divide-y divide-gray-200 text-sm">
                {order.order_items?.map((item, i) => (
                  <li key={i} className="py-2 flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-800">{item.menu?.name}</p>
                      <p className="text-xs text-gray-500">{item.quantity} x Rp {item.price.toLocaleString('id-ID')}</p>
                    </div>
                    <p className="text-amber-900 font-bold">
                      Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            {/* 💰 Total */}
            <div className="text-right border-t pt-4">
              <p className="text-lg font-bold text-amber-900">
                Total: Rp {order.total.toLocaleString('id-ID')}
              </p>
            </div>
          </div>
        )}
      </main>
    </>
  );
};

export default OrderStatus;
