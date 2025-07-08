// File: src/admin/AdminApp.jsx

import { Routes, Route } from 'react-router-dom'; // Import komponen routing
import AdminLogin from './pages/AdminLogin'; // Halaman login admin
import Dashboard from './pages/Dashboard'; // Dashboard utama admin
import ManageMenu from './pages/ManageMenu'; // Halaman CRUD menu
import ManageOrders from './pages/ManageOrders'; // Halaman manajemen pesanan
import Reports from './pages/Reports'; // Halaman laporan penjualan

// Komponen AdminApp berfungsi sebagai router utama untuk semua halaman admin
const AdminApp = () => (
  <Routes>
    {/* Route untuk halaman login admin */}
    <Route path="/login" element={<AdminLogin />} />

    {/* Route ke dashboard admin */}
    <Route path="/dashboard" element={<Dashboard />} />

    {/* Route untuk halaman kelola menu */}
    <Route path="/menu" element={<ManageMenu />} />

    {/* Route untuk halaman kelola pesanan */}
    <Route path="/orders" element={<ManageOrders />} />

    {/* Route untuk halaman laporan */}
    <Route path="/reports" element={<Reports />} />
  </Routes>
);

export default AdminApp;
