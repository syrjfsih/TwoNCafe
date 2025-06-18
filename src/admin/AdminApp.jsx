import { Routes, Route } from 'react-router-dom';
import AdminLogin from './pages/AdminLogin';
import Dashboard from './pages/Dashboard';
import ManageMenu from './pages/ManageMenu';
import ManageOrders from './pages/ManageOrders';
import Reports from './pages/Reports';

const AdminApp = () => (
  <Routes>
    <Route path="/login" element={<AdminLogin />} />
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/menu" element={<ManageMenu />} />
    <Route path="/orders" element={<ManageOrders />} />
    <Route path="/reports" element={<Reports />} />
  </Routes>
);

export default AdminApp;
