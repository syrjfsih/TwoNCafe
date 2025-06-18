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
      className="w-full max-w-sm bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group"
    >
      <div className="relative h-36 sm:h-48 overflow-hidden">
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

      <div className="p-4 flex flex-col justify-between h-44">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-gray-800 group-hover:text-amber-900 transition">
            {name}
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">
            {description}
          </p>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm sm:text-xl font-bold text-amber-800">
            Rp {typeof price === 'number' ? price.toLocaleString('id-ID') : '0'}
          </span>
          <button
            onClick={handleClick}
            className="bg-amber-900 text-white text-[10px] sm:text-sm px-2.5 sm:px-4 py-1 sm:py-2 rounded-full hover:bg-amber-800 transition font-semibold"
          >
            + Keranjang
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default MenuCard;
