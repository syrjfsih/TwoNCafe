import React from 'react';
import { motion } from 'framer-motion';

const MenuCard = ({ name = 'Tidak ada nama', image, price = 0, description = 'Tidak ada deskripsi', onAddToCart }) => {
  const handleClick = () => {
    onAddToCart({ name, image, price, description });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-sm bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group
        max-[300px]:max-w-[240px] max-[300px]:mx-auto"
    >
      {/* Gambar */}
      <div className="relative h-32 sm:h-40 md:h-48 overflow-hidden">
        <img
          src={image || '/foto menu/default.jpg'}
          alt={name}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/foto menu/default.jpg';
          }}
        />
        <div className="absolute top-2 left-2 bg-amber-900 text-white text-[10px] sm:text-xs px-2 py-1 rounded shadow">
          Recommended
        </div>
      </div>

      {/* Konten */}
      <div className="p-3 sm:p-4 flex flex-col justify-between h-44 sm:h-48 md:h-52">
        <div>
          <h3 className="text-sm sm:text-base md:text-lg font-bold text-gray-800 group-hover:text-amber-900 transition">
            {name}
          </h3>
          <p className="text-[10px] sm:text-xs md:text-sm text-gray-600 mt-1 line-clamp-2">
            {description}
          </p>
        </div>

        {/* Harga & Tombol */}
        <div className="mt-3 sm:mt-4 flex items-center justify-between">
          <span className="text-sm sm:text-base md:text-lg font-bold text-amber-800">
            Rp {typeof price === 'number' ? price.toLocaleString('id-ID') : '0'}
          </span>
          <button
            onClick={handleClick}
            className="bg-amber-900 text-white text-[10px] sm:text-xs md:text-sm px-2 sm:px-3 md:px-4 py-1 rounded-full hover:bg-amber-800 transition font-semibold"
          >
            + Keranjang
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default MenuCard;
