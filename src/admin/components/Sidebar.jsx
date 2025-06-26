import { NavLink } from 'react-router-dom';
import {
  FiHome,
  FiList,
  FiShoppingBag,
  FiBarChart2,
  FiLogOut
} from 'react-icons/fi';

const Sidebar = () => {
  return (
    <aside className="w-64 min-h-screen bg-[#702F25] text-white p-6 hidden md:flex flex-col justify-between shadow-md">
      <div>
        <h2 className="text-2xl font-bold mb-10 text-center">TwoNCafe</h2>
        <nav className="flex flex-col gap-4">
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

      <NavLink
        to="/admin/login"
        className="flex items-center gap-3 px-4 py-2 rounded-md hover:bg-red-700 text-red-200"
      >
        <FiLogOut /> Logout
      </NavLink>
    </aside>
  );
};

export default Sidebar;
