import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar,
} from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import { supabase } from '../../services/supabase';

const LaporanPenjualan = () => {
  const [orders, setOrders] = useState([]);
  const [dailyData, setDailyData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('id, total, created_at')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('❌ Gagal ambil data pesanan:', error.message);
        return;
      }

      setOrders(data);

      // Proses data harian
      const harianMap = {};
      data.forEach(order => {
        const tanggal = order.created_at.slice(0, 10); // yyyy-mm-dd
        harianMap[tanggal] = (harianMap[tanggal] || 0) + order.total;
      });
      const harianArray = Object.entries(harianMap).map(([tanggal, total]) => ({
        tanggal,
        total,
      }));
      setDailyData(harianArray);

      // Data 7 hari terakhir
      const minggu = harianArray.slice(-7);
      setWeeklyData(minggu);

      // Data bulanan
      const bulananMap = {};
      data.forEach(order => {
        const bulan = order.created_at.slice(0, 7); // yyyy-mm
        bulananMap[bulan] = (bulananMap[bulan] || 0) + order.total_harga;
      });
      const bulanArray = Object.entries(bulananMap).map(([bulan, total]) => ({
        bulan,
        total,
      }));
      setMonthlyData(bulanArray);
    };

    fetchOrders();
  }, []);

  // Filter berdasarkan tanggal
  const filtered = dailyData.filter((d) => {
    if (!startDate || !endDate) return true;
    return d.tanggal >= startDate && d.tanggal <= endDate;
  });

  const totalProfit = filtered.reduce((sum, d) => sum + d.total, 0);

  const handleExportPDF = () => {
    const input = document.getElementById('laporan-area');
    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF();
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('laporan-penjualan.pdf');
    });
  };

  const handleExportExcel = () => {
    const data = filtered.map((item) => ({
      Tanggal: item.tanggal,
      Total: item.total,
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'LaporanHarian');
    XLSX.writeFile(workbook, 'laporan-penjualan.xlsx');
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold text-[#702F25] mb-6">Laporan Penjualan</h1>

        {/* Filter + tombol export */}
        <div className="flex flex-wrap gap-4 items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border px-3 py-1 rounded-md"
            />
            <span className="text-gray-700">sampai</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border px-3 py-1 rounded-md"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExportPDF}
              className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-md"
            >
              Export PDF
            </button>
            <button
              onClick={handleExportExcel}
              className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-md"
            >
              Export Excel
            </button>
          </div>
        </div>

        {/* Laporan Area */}
        <div id="laporan-area" className="space-y-8">
          {/* Total */}
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">
              Total Profit:{' '}
              <span className="font-semibold text-green-700">
                Rp {totalProfit.toLocaleString()}
              </span>
            </p>
          </div>

          {/* Harian */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Keuntungan Harian</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={filtered}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="tanggal" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="total" stroke="#702F25" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Mingguan */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Keuntungan Mingguan</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="tanggal" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" fill="#F97316" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Bulanan */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Keuntungan Bulanan</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="bulan" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" fill="#15803D" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LaporanPenjualan;
