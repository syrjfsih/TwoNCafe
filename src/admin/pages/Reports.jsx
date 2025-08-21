// File: src/admin/pages/Reports.jsx

import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar,
} from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import { supabase } from '../../services/supabase';

const Reports = () => {
  const [orders, setOrders] = useState([]);
  const [dailyData, setDailyData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [mostSold, setMostSold] = useState(null);
  const [leastSold, setLeastSold] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('id, total, created_at')
        .order('created_at', { ascending: true });

      const { data: itemsData, error: itemsError } = await supabase
        .from('order_items')
        .select('menu_id, quantity, menu(name)');

      if (ordersError || itemsError) {
        console.error('Gagal ambil data:', ordersError || itemsError);
        return;
      }

      setOrders(ordersData);

      const harianMap = {};
      ordersData.forEach(order => {
        const tanggal = order.created_at.slice(0, 10);
        harianMap[tanggal] = (harianMap[tanggal] || 0) + order.total;
      });
      const harianArray = Object.entries(harianMap).map(([tanggal, total]) => ({ tanggal, total }));
      setDailyData(harianArray);

      const minggu = harianArray.slice(-7);
      setWeeklyData(minggu);

      const bulananMap = {};
      ordersData.forEach(order => {
        const bulan = order.created_at.slice(0, 7);
        bulananMap[bulan] = (bulananMap[bulan] || 0) + order.total;
      });
      const bulanArray = Object.entries(bulananMap).map(([bulan, total]) => ({ bulan, total }));
      setMonthlyData(bulanArray);

      const menuStats = {};
      itemsData.forEach(item => {
        const namaMenu = item.menu?.name || 'Tidak diketahui';
        menuStats[namaMenu] = (menuStats[namaMenu] || 0) + item.quantity;
      });
      const sorted = Object.entries(menuStats).sort((a, b) => b[1] - a[1]);
      setMostSold(sorted[0]);
      setLeastSold(sorted[sorted.length - 1]);
    };

    fetchOrders();
  }, []);

  const filtered = dailyData.filter((d) => {
    if (!startDate || !endDate) return true;
    return d.tanggal >= startDate && d.tanggal <= endDate;
  });

  const totalProfit = filtered.reduce((sum, d) => sum + d.total, 0);

  const generateSummaryTable = () => ([
    ['Total Keuntungan', `Rp ${totalProfit.toLocaleString()}`],
    ['Menu Paling Sering Dibeli', mostSold ? `${mostSold[0]} (${mostSold[1]})` : '-'],
    ['Menu Paling Jarang Dibeli', leastSold ? `${leastSold[0]} (${leastSold[1]})` : '-']
  ]);

  const handleExportPDF = () => {
    const input = document.getElementById('laporan-area');
    html2canvas(input, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgProps = pdf.getImageProperties(imgData);
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

      const yOffset = pdfHeight + 10;
      const summary = generateSummaryTable();
      summary.forEach(([label, value], index) => {
        pdf.text(`${label}: ${value}`, 10, yOffset + index * 7);
      });

      pdf.save('laporan-penjualan.pdf');
    });
  };

  const exportToExcel = (data, filename, label) => {
    const summary = generateSummaryTable();
    const summarySheet = XLSX.utils.aoa_to_sheet([
      ['Ringkasan'],
      ...summary,
      [],
      [label],
      ['Tanggal/Bulan', 'Total'],
      ...data.map(item => Object.values(item))
    ]);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Laporan');
    XLSX.writeFile(workbook, filename);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold text-[#702F25] mb-6">Laporan Penjualan</h1>

        <div className="flex flex-wrap gap-4 items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="border px-3 py-1 rounded-md" />
            <span className="text-gray-700">sampai</span>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="border px-3 py-1 rounded-md" />
          </div>
          <div className="flex gap-3">
            <button onClick={handleExportPDF} className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-md">Export PDF</button>
            <button onClick={() => exportToExcel(dailyData, 'laporan-harian.xlsx', 'Laporan Harian')} className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-md">Export Harian</button>
            <button onClick={() => exportToExcel(weeklyData, 'laporan-mingguan.xlsx', 'Laporan Mingguan')} className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-md">Export Mingguan</button>
            <button onClick={() => exportToExcel(monthlyData, 'laporan-bulanan.xlsx', 'Laporan Bulanan')} className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-md">Export Bulanan</button>
          </div>
        </div>

        <div id="laporan-area" className="space-y-8">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Total Profit: <span className="font-semibold text-green-700">Rp {totalProfit.toLocaleString()}</span></p>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Keuntungan Harian</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={filtered} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="tanggal" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="total" stroke="#702F25" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Keuntungan Mingguan</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="tanggal" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" fill="#F97316" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Keuntungan Bulanan</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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

export default Reports;