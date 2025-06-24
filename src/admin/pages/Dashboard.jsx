// File: Dashboard.jsx
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { supabase } from '../../services/supabase';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const [summary, setSummary] = useState({
    totalHariIni: 0,
    jumlahPesanan: 0,
    menuAktif: 0,
    trenHarian: [],
  });

  const [pesananTerbaru, setPesananTerbaru] = useState([]);
  const [tidakAdaPesanan, setTidakAdaPesanan] = useState(false);
  const [mejaAktif, setMejaAktif] = useState([]);
  const [loading, setLoading] = useState(true);
  const prevMejaAktifRef = useRef([]);

  const today = new Date().toISOString().split('T')[0];

  const fetchData = async () => {
    setLoading(true);

    try {
      const { data: orders, error: orderErr } = await supabase
        .from('orders')
        .select('id, name, table_number, total, created_at, ended_at')
        .order('created_at', { ascending: false });

      if (orderErr) throw orderErr;

      const { data: orderItems, error: itemErr } = await supabase
        .from('order_items')
        .select('order_id, menu_id, quantity, menu(name)')
        .order('order_id', { ascending: false });

      if (itemErr) throw itemErr;

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

      const mejaSedangAktif = orders
        .filter((o) => o.ended_at === null)
        .map((o) => o.table_number);

      const mejaUnik = [...new Set(mejaSedangAktif.map((m) => parseInt(m)))];

      // Deteksi meja baru aktif
      const prev = prevMejaAktifRef.current;
      const newlyActive = mejaUnik.filter((m) => !prev.includes(m));
      if (newlyActive.length > 0) {
        toast.info(`🔔 Meja ${newlyActive.join(', ')} baru saja aktif.`);
      }
      prevMejaAktifRef.current = mejaUnik;

      setMejaAktif(mejaUnik);

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

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 p-6">
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

        {loading ? (
          <p>Memuat data...</p>
        ) : (
          <>
            {tidakAdaPesanan && (
              <div className="bg-yellow-100 text-yellow-800 p-3 rounded-md mb-4">
                Belum ada pesanan hari ini.
              </div>
            )}

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
                      className={`text-center px-3 py-2 rounded-lg font-semibold text-sm shadow ${
                        isAktif
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
