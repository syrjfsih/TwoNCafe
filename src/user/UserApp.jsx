// File: UserApp.jsx

// Import komponen routing dari react-router-dom
import { Routes, Route } from 'react-router-dom';

// Import halaman-halaman utama user
import Home from './pages/Home';
import Menu from './pages/Menu';
import MenuDetail from './pages/MenuDetail';
import Checkout from './pages/Checkout';
import OrderStatus from './pages/OrderStatus';
import BlockedPage from './pages/BlockedPage';

// Import guard untuk membatasi akses di luar jam operasional
import JamOperasionalGuard from './components/JamOperasionalGuard';

// Komponen utama yang menampung semua rute user
const UserApp = () => (
  // Semua halaman ini dibungkus dengan guard jam operasional
  <JamOperasionalGuard>
    <Routes>
      {/* Halaman Home – Tampilan awal setelah scan QR */}
      <Route path="/" element={<Home />} />

      {/* Halaman Daftar Menu */}
      <Route path="/menu" element={<Menu />} />

      {/* Halaman Detail Menu berdasarkan ID */}
      <Route path="/menu/:id" element={<MenuDetail />} />

      {/* Halaman Checkout (data pesanan) */}
      <Route path="/checkout" element={<Checkout />} />

      {/* Halaman untuk melihat status pesanan */}
      <Route path="/status" element={<OrderStatus />} />

      {/* Halaman blokir jika di luar jam operasional */}
      <Route path="/blocked" element={<BlockedPage />} />
    </Routes>
  </JamOperasionalGuard>
);

export default UserApp;
