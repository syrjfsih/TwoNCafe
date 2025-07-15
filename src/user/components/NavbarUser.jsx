import { useState, useEffect } from 'react';
import { FaBars, FaTimes } from 'react-icons/fa';
import { NavLink, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const UserNavbar = () => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [nomorMeja, setNomorMeja] = useState(() => localStorage.getItem('nomorMeja') || '');
  const [namaPemesan, setNamaPemesan] = useState(() => localStorage.getItem('namaPemesan') || '');

  const toggleMobileMenu = () => setShowMobileMenu((prev) => !prev);
  const closeMenu = () => setShowMobileMenu(false);

  useEffect(() => {
    const updateState = () => {
      setNomorMeja(localStorage.getItem('nomorMeja') || '');
      setNamaPemesan(localStorage.getItem('namaPemesan') || '');
    };

    updateState();

    // Perbarui jika user ganti tab atau reload dari link
    window.addEventListener('storage', updateState);
    window.addEventListener('popstate', updateState); // ← tambahan ini

    return () => {
      window.removeEventListener('storage', updateState);
      window.removeEventListener('popstate', updateState);
    };
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 },
    },
    exit: { opacity: 0 },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const query = nomorMeja
    ? `?meja=${nomorMeja}${namaPemesan ? `&nama=${encodeURIComponent(namaPemesan)}` : ''}`
    : '';

  return (
    <header className="bg-amber-900 shadow-md sticky top-0 z-50">
      <div className="max-w-8xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo dan brand */}
        <Link to={nomorMeja ? `/${query}` : '/'} className="flex items-center gap-2">
          <img src="/foto menu/logo.png" alt="TwoNCafe Logo" className="h-9 w-9" />
          <span className="text-2xl font-bold text-white">TwoNCafe</span>
        </Link>

        {/* Menu desktop */}
        <nav className="hidden md:flex gap-10 ml-auto">
          <NavLink
            to={nomorMeja ? `/${query}` : '/'}
            className="text-lg font-medium hover:text-amber-200 text-white"
          >
            Beranda
          </NavLink>

          <NavLink
            to={nomorMeja ? `/menu${query}` : '#'}
            onClick={(e) => {
              if (!nomorMeja) {
                e.preventDefault();
                toast.error('❗ Silakan scan QR kode di meja dulu!');
              }
            }}
            className={`text-lg font-medium hover:text-amber-200 text-white ${!nomorMeja ? 'opacity-50 cursor-not-allowed' : ''
              }`}
          >
            Menu
          </NavLink>

          <NavLink
            to={nomorMeja ? `/status${query}` : '#'}
            onClick={(e) => {
              if (!nomorMeja) {
                e.preventDefault();
                toast.error('❗ Silakan scan QR kode di meja dulu!');
              }
            }}
            className={`text-lg font-medium hover:text-amber-200 text-white ${!nomorMeja ? 'opacity-50 cursor-not-allowed' : ''
              }`}
          >
            Pesananmu
          </NavLink>
        </nav>

        {/* Toggle menu mobile */}
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

      {/* Menu versi mobile */}
      <AnimatePresence>
        {showMobileMenu && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-40 z-40"
              onClick={closeMenu}
            />

            <motion.nav
              key="mobilemenu"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-50 bg-amber-900 text-white flex items-center justify-center"
            >
              <motion.ul
                className="space-y-6 w-full max-w-sm px-6 text-lg font-medium text-center"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                {/* Beranda */}
                <motion.li variants={itemVariants} whileTap={{ scale: 0.97 }}>
                  <NavLink
                    to={nomorMeja ? `/${query}` : '/'}
                    className="block py-3 rounded-lg hover:bg-amber-800"
                    onClick={closeMenu}
                  >
                    🏠 Beranda
                  </NavLink>
                </motion.li>

                {/* Menu */}
                <motion.li variants={itemVariants} whileTap={{ scale: 0.97 }}>
                  <NavLink
                    to={nomorMeja ? `/menu${query}` : '#'}
                    onClick={(e) => {
                      if (!nomorMeja) {
                        e.preventDefault();
                        toast.error('❗ Silakan scan QR kode di meja dulu!');
                      } else {
                        closeMenu();
                      }
                    }}
                    className={`block py-3 rounded-lg transition ${nomorMeja ? 'hover:bg-amber-800' : 'opacity-50 cursor-not-allowed'
                      }`}
                  >
                    📋 Menu
                  </NavLink>
                </motion.li>

                {/* Status */}
                <motion.li variants={itemVariants} whileTap={{ scale: 0.97 }}>
                  <NavLink
                    to={nomorMeja ? `/status${query}` : '#'}
                    onClick={(e) => {
                      if (!nomorMeja) {
                        e.preventDefault();
                        toast.error('❗ Silakan scan QR kode di meja dulu!');
                      } else {
                        closeMenu();
                      }
                    }}
                    className={`block py-3 rounded-lg transition ${nomorMeja ? 'hover:bg-amber-800' : 'opacity-50 cursor-not-allowed'
                      }`}
                  >
                    🧾 Pesananmu
                  </NavLink>
                </motion.li>

                {/* Tutup */}
                <motion.li variants={itemVariants} whileTap={{ scale: 0.95 }}>
                  <button
                    onClick={closeMenu}
                    className="mt-6 px-6 py-2 text-sm border border-white rounded-full hover:bg-white hover:text-amber-900 transition"
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
