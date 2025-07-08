// Import library routing dari React Router DOM
import { Routes, Route } from 'react-router-dom';

// Import halaman-halaman (page) admin
import AdminLogin from './pages/AdminLogin';
import Dashboard from './pages/Dashboard';
import ManageMenu from './pages/ManageMenu';
import ManageOrders from './pages/ManageOrders';
import Reports from './pages/Reports';

// Import komponen proteksi rute agar halaman admin hanya bisa diakses setelah login
import AdminProtectedRoute from './components/AdminProtectedRoute';

const AdminApp = () => (
  <Routes>
    {/* 🔐 Route untuk halaman login admin */}
    <Route path="/login" element={<AdminLogin />} />

    {/* 🔒 Semua halaman berikut akan diproteksi menggunakan AdminProtectedRoute */}
    <Route element={<AdminProtectedRoute />}>
      {/* 📊 Dashboard Admin: Menampilkan ringkasan statistik & grafik */}
      <Route path="/dashboard" element={<Dashboard />} />
      
      {/* 📋 Kelola Menu: Admin dapat menambah, mengedit, dan menghapus menu */}
      <Route path="/menu" element={<ManageMenu />} />
      
      {/* 🧾 Kelola Pesanan: Melihat, ubah status, atau hapus pesanan yang masuk */}
      <Route path="/orders" element={<ManageOrders />} />
      
      {/* 📈 Laporan Penjualan: Melihat dan mengekspor laporan transaksi */}
      <Route path="/reports" element={<Reports />} />
    </Route>
  </Routes>
);

export default AdminApp;
