// File: Dashboard.jsx
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { supabase } from '../../services/supabase';
import { toast } from 'react-toastify';

const Dashboard = () => {
  // State untuk menyimpan ringkasan data
  const [summary, setSummary] = useState({
    totalHariIni: 0,
    jumlahPesanan: 0,
    menuAktif: 0,
    trenHarian: [],
  });

  const [pesananTerbaru, setPesananTerbaru] = useState([]); // Menyimpan 5 pesanan terakhir
  const [tidakAdaPesanan, setTidakAdaPesanan] = useState(false); // Notifikasi jika belum ada pesanan
  const [mejaAktif, setMejaAktif] = useState([]); // Menyimpan meja yang sedang digunakan
  const [loading, setLoading] = useState(true); // Loading indicator
  const prevMejaAktifRef = useRef([]); // Untuk mendeteksi perubahan status meja aktif

  // Jam buka dan tutup
  const [openingTime, setOpeningTime] = useState('08:00');
  const [closingTime, setClosingTime] = useState('22:00');

  const today = new Date().toISOString().split('T')[0]; // Format tanggal hari ini

  // Fungsi untuk mengambil semua data yang diperlukan
  const fetchData = async () => {
    setLoading(true);
    try {
      // Ambil jam operasional
      const { data: settingsData, error: settingsErr } = await supabase
        .from('settings')
        .select('opening_time, closing_time')
        .eq('id', 1)
        .single();

      if (settingsErr) throw settingsErr;
      if (settingsData) {
        setOpeningTime(settingsData.opening_time);
        setClosingTime(settingsData.closing_time);
      }

      // Ambil semua pesanan
      const { data: orders, error: orderErr } = await supabase
        .from('orders')
        .select('id, name, table_number, total, created_at, ended_at')
        .order('created_at', { ascending: false });

      if (orderErr) throw orderErr;

      // Ambil item pesanan untuk mendapatkan nama menu
      const { data: orderItems, error: itemErr } = await supabase
        .from('order_items')
        .select('order_id, menu_id, quantity, menu(name)')
        .order('order_id', { ascending: false });

      if (itemErr) throw itemErr;

      // Ambil data menu
      const { data: menus, error: menuErr } = await supabase
        .from('menu')
        .select('id, aktif');

      if (menuErr) throw menuErr;

      const activeMenus = menus.filter((m) => m.aktif);
      const hariIni = orders.filter((o) => o.created_at.startsWith(today));
      const totalHariIni = hariIni.reduce((sum, o) => sum + o.total, 0);
      const jumlahPesanan = hariIni.length;
      const menuAktif = activeMenus.length;

      setTidakAdaPesanan(jumlahPesanan === 0);

      // Cek meja aktif (belum ada ended_at)
      const mejaSedangAktif = orders
        .filter((o) => o.ended_at === null)
        .map((o) => o.table_number);
      const mejaUnik = [...new Set(mejaSedangAktif.map((m) => parseInt(m)))];

      const prev = prevMejaAktifRef.current;
      const newlyActive = mejaUnik.filter((m) => !prev.includes(m));
      if (newlyActive.length > 0) {
        toast.info(`🔔 Meja ${newlyActive.join(', ')} baru saja aktif.`);
      }
      prevMejaAktifRef.current = mejaUnik;
      setMejaAktif(mejaUnik);

      // Hitung tren harian 7 hari terakhir
      const trenDummy = {};
      for (let i = 6; i >= 0; i--) {
        const d = new Date(Date.now() - i * 86400000);
        const key = d.toISOString().split('T')[0];
        trenDummy[key] = 0;
      }

      orders.forEach((p) => {
        const tanggal = p.created_at.split('T')[0];
        if (trenDummy[tanggal] !== undefined) {
          trenDummy[tanggal] += p.total;
        }
      });

      const trenHarian = Object.entries(trenDummy).map(([tanggal, total]) => ({
        tanggal,
        total,
      }));

      // Ambil 5 pesanan terbaru
      const terbaru = orders.slice(0, 5).map((order) => {
        const items = orderItems.filter((i) => i.order_id === order.id);
        const menuNames = items.map((m) => m.menu?.name).join(', ') || '—';
        return {
          id: order.id,
          nama: order.name,
          menu: menuNames,
          total: order.total,
        };
      });

      setPesananTerbaru(terbaru);
      setSummary({ totalHariIni, jumlahPesanan, menuAktif, trenHarian });
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  // Simpan jam operasional ke tabel settings
  const simpanJamOperasional = async () => {
    const { error } = await supabase
      .from('settings')
      .update({
        opening_time: openingTime,
        closing_time: closingTime,
      })
      .eq('id', 1);

    if (error) {
      toast.error('❌ Gagal menyimpan jam operasional');
    } else {
      toast.success('✅ Jam operasional berhasil disimpan');
    }
  };

  // Ambil data setiap 10 detik
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-[#702F25]">Dashboard Admin</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">BangRajz (Admin)</span>
            <img
              src="/public/foto menu/raj.jpg"
              alt="Admin"
              className="w-10 h-10 rounded-full border-2 border-[#702F25]"
            />
          </div>
        </div>

        {/* Jam Operasional */}
        <div className="bg-white rounded-lg shadow p-4 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Jam Operasional</h2>
          <div className="grid grid-cols-2 gap-4 max-w-md mb-3">
            <div>
              <label className="text-sm text-gray-700">Jam Buka</label>
              <input
                type="time"
                value={openingTime}
                onChange={(e) => setOpeningTime(e.target.value)}
                className="w-full border px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-[#702F25] outline-none"
              />
            </div>
            <div>
              <label className="text-sm text-gray-700">Jam Tutup</label>
              <input
                type="time"
                value={closingTime}
                onChange={(e) => setClosingTime(e.target.value)}
                className="w-full border px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-[#702F25] outline-none"
              />
            </div>
          </div>
          <button
            onClick={simpanJamOperasional}
            className="px-4 py-2 bg-[#702F25] text-white rounded-md text-sm hover:bg-[#5a241d]"
          >
            Simpan Jam Operasional
          </button>
        </div>

        {/* Konten utama dashboard */}
        {loading ? (
          <p>Memuat data...</p>
        ) : (
          <>
            {tidakAdaPesanan && (
              <div className="bg-yellow-100 text-yellow-800 p-3 rounded-md mb-4">
                Belum ada pesanan hari ini.
              </div>
            )}

            {/* Statistik Ringkas */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
              <div className="bg-white shadow rounded-lg p-4">
                <h3 className="text-gray-600 text-sm">Pendapatan Hari Ini</h3>
                <p className="text-2xl font-bold text-green-700">
                  Rp {summary.totalHariIni.toLocaleString()}
                </p>
              </div>
              <div className="bg-white shadow rounded-lg p-4">
                <h3 className="text-gray-600 text-sm">Pesanan Hari Ini</h3>
                <p className="text-2xl font-bold text-orange-700">
                  {summary.jumlahPesanan}
                </p>
              </div>
              <div className="bg-white shadow rounded-lg p-4">
                <h3 className="text-gray-600 text-sm">Menu Aktif</h3>
                <p className="text-2xl font-bold text-[#702F25]">
                  {summary.menuAktif}
                </p>
              </div>
            </div>

            {/* Grafik Penjualan */}
            <div className="bg-white rounded-lg shadow p-4 mb-8">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-semibold text-gray-800">
                  Grafik Penjualan 7 Hari Terakhir
                </h2>
                <button
                  onClick={fetchData}
                  className="px-3 py-1 bg-[#702F25] hover:bg-[#5a241d] text-white text-sm rounded-md"
                >
                  Reload Grafik
                </button>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={summary.trenHarian}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="tanggal" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#702F25"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Status Meja */}
            <div className="bg-white rounded-lg shadow p-4 mb-8">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">
                Status Semua Meja (1–30)
              </h2>
              <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-10 gap-3">
                {Array.from({ length: 30 }, (_, i) => {
                  const no = i + 1;
                  const isAktif = mejaAktif.includes(no);
                  return (
                    <div
                      key={no}
                      className={`text-center px-3 py-2 rounded-lg font-semibold text-sm shadow ${isAktif
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                        }`}
                    >
                      Meja {no}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Daftar Pesanan Terbaru */}
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">
                5 Pesanan Terakhir
              </h2>
              <ul className="divide-y divide-gray-200">
                {pesananTerbaru.map((p) => (
                  <li key={p.id} className="py-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold">{p.nama}</p>
                        <p className="text-xs text-gray-500 italic">{p.menu}</p>
                      </div>
                      <p className="text-sm text-gray-700">
                        Rp {p.total.toLocaleString()}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
