// File: src/admin/components/Sidebar.jsx

import { NavLink } from 'react-router-dom'; // Import NavLink untuk navigasi aktif
import {
  FiHome,
  FiList,
  FiShoppingBag,
  FiBarChart2,
  FiLogOut
} from 'react-icons/fi'; // Import ikon dari react-icons (Feather Icons)

const Sidebar = () => {
  return (
    // Sidebar hanya tampil di ukuran layar medium ke atas (md:flex)
    <aside className="w-64 min-h-screen bg-[#702F25] text-white p-6 hidden md:flex flex-col justify-between shadow-md">
      <div>
        {/* Logo atau Judul Aplikasi */}
        <h2 className="text-2xl font-bold mb-10 text-center">TwoNCafe</h2>

        {/* Navigasi utama admin */}
        <nav className="flex flex-col gap-4">
          {/* Link ke Dashboard Admin */}
          <NavLink
            to="/admin/dashboard"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2 rounded-md hover:bg-[#5a241d] ${
                isActive ? 'bg-[#5a241d]' : ''
              }`
            }
          >
            <FiHome /> Dashboard
          </NavLink>

          {/* Link ke halaman Kelola Menu */}
          <NavLink
            to="/admin/menu"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2 rounded-md hover:bg-[#5a241d] ${
                isActive ? 'bg-[#5a241d]' : ''
              }`
            }
          >
            <FiList /> Kelola Menu
          </NavLink>

          {/* Link ke halaman Manajemen Pesanan */}
          <NavLink
            to="/admin/orders"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2 rounded-md hover:bg-[#5a241d] ${
                isActive ? 'bg-[#5a241d]' : ''
              }`
            }
          >
            <FiShoppingBag /> Pesanan
          </NavLink>

          {/* Link ke halaman Laporan Penjualan */}
          <NavLink
            to="/admin/reports"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2 rounded-md hover:bg-[#5a241d] ${
                isActive ? 'bg-[#5a241d]' : ''
              }`
            }
          >
            <FiBarChart2 /> Laporan Penjualan
          </NavLink>
        </nav>
      </div>

      {/* Tombol Logout */}
      <NavLink
        to="/admin/login" // Akan diarahkan kembali ke halaman login (belum pakai fungsi logout Supabase)
        className="flex items-center gap-3 px-4 py-2 rounded-md hover:bg-red-700 text-red-200"
      >
        <FiLogOut /> Logout
      </NavLink>
    </aside>
  );
};

export default Sidebar;
