// File: src/components/UserNavbar.jsx
import { useState } from 'react';
import { FaBars, FaTimes } from 'react-icons/fa';
import { NavLink, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const UserNavbar = () => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const toggleMobileMenu = () => setShowMobileMenu((prev) => !prev);
  const closeMenu = () => setShowMobileMenu(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 }
    },
    exit: { opacity: 0 }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <header className="bg-amber-900 shadow-md sticky top-0 z-50">
      <div className="max-w-8xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img src="/foto menu/logo.png" alt="TwoNCafe Logo" className="h-9 w-9" />
          <span className="text-2xl font-bold text-white">TwoNCafe</span>
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden md:flex gap-10 ml-auto">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `text-lg font-medium hover:text-amber-200 transition-colors ${
                isActive ? 'text-white' : 'text-white'
              }`
            }
          >
            Beranda
          </NavLink>
          <NavLink
  to={`/menu?meja=${nomorMeja || ''}`}
  className={({ isActive }) =>
    `text-lg font-medium hover:text-amber-200 transition-colors ${
      isActive ? 'text-white' : 'text-white'
    }`
  }
>
  Menu
</NavLink>

          <NavLink
            to="/status"
            className={({ isActive }) =>
              `text-lg font-medium hover:text-amber-200 transition-colors ${
                isActive ? 'text-white' : 'text-white'
              }`
            }
          >
            Pesananmu
          </NavLink>
        </nav>

        {/* Hamburger Button */}
        <div className="md:hidden">
          <button
            onClick={toggleMobileMenu}
            className="text-white text-2xl focus:outline-none"
            aria-label="Toggle Menu"
          >
            {showMobileMenu ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      {/* Mobile Fullscreen Overlay */}
      <AnimatePresence>
        {showMobileMenu && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-40 z-40"
              onClick={closeMenu}
            />

            {/* Menu Content */}
            <motion.nav
              key="mobilemenu"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-50 bg-amber-900 text-white flex flex-col items-center justify-center"
            >
              <motion.ul
                className="space-y-8 text-2xl font-semibold text-center"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <motion.li variants={itemVariants}>
                  <NavLink to="/" onClick={closeMenu} className="hover:text-amber-300 transition">
                    🏠 Beranda
                  </NavLink>
                </motion.li>
                <motion.li variants={itemVariants}>
                  <NavLink to="/menu" onClick={closeMenu} className="hover:text-amber-300 transition">
                    📋 Menu
                  </NavLink>
                </motion.li>
                <motion.li variants={itemVariants}>
                  <NavLink to="/status" onClick={closeMenu} className="hover:text-amber-300 transition">
                    🧾 Pesananmu
                  </NavLink>
                </motion.li>
                <motion.li variants={itemVariants}>
                  <button
                    onClick={closeMenu}
                    className="mt-8 px-5 py-2 text-sm border border-white rounded-full hover:bg-white hover:text-amber-900 transition"
                  >
                    ✖️ Tutup Menu
                  </button>
                </motion.li>
              </motion.ul>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};

export default UserNavbar;
