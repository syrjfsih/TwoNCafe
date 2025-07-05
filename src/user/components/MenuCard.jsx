import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const MenuCard = ({
  id,
  name = 'Tidak ada nama',
  image,
  price = 0,
  description = 'Tidak ada deskripsi',
  stock = 0,
  onAddToCart
}) => {
  const handleClick = () => {
    if (stock > 0) {
      onAddToCart({ id, name, image, price, description });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-[240px] sm:max-w-none bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group mx-auto relative"
    >
      <div className="relative h-32 xs:h-36 sm:h-40 md:h-44 lg:h-48 xl:h-52 overflow-hidden">
        <Link to={`/menu/${id}`} title="Detail">
          <img
            src={image || '/foto menu/default.jpg'}
            alt={name}
            className={`w-full h-full object-cover transform transition-transform duration-300 ${
              stock === 0 ? 'opacity-40 grayscale' : 'group-hover:scale-105'
            }`}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/foto menu/default.jpg';
            }}
          />
        </Link>

        {stock === 0 && (
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center z-10">
            <span className="text-white font-bold text-sm sm:text-base">Stok Habis</span>
          </div>
        )}

        <div className="absolute top-2 left-2 bg-amber-900 text-white text-[9px] sm:text-xs px-2 py-0.5 rounded shadow">
          Recommended
        </div>
      </div>

      <div className="p-3 sm:p-4 flex flex-col justify-between h-40 sm:h-44 md:h-48">
        <div>
          <h3 className="text-sm sm:text-base md:text-lg font-bold text-gray-800 group-hover:text-amber-900 transition">
            {name}
          </h3>
          <p className="text-[10px] sm:text-xs md:text-sm text-gray-600 mt-1 line-clamp-2">
            {description}
          </p>
          <p className="text-[10px] sm:text-xs text-gray-500 mt-1 italic">
            Stok: {stock}
          </p>
        </div>

        <div className="mt-3 sm:mt-4 flex items-center justify-between">
          <span className="text-sm sm:text-base md:text-lg font-bold text-amber-800">
            Rp {typeof price === 'number' ? price.toLocaleString('id-ID') : '0'}
          </span>
          <button
            onClick={handleClick}
            disabled={stock === 0}
            className={`text-[10px] sm:text-xs px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-semibold transition ${
              stock === 0
                ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                : 'bg-amber-900 text-white hover:bg-amber-800'
            }`}
          >
            {stock === 0 ? 'Stok Habis' : '+ Keranjang'}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default MenuCard;
