import { useState } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';

const MenuCard = ({ image, name, description, price, stock = 0, onEdit, onDelete }) => {
  const [loading, setLoading] = useState(true);
  const fallbackImage = '/foto menu/default.jpg';

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 flex flex-col h-full p-4 border border-gray-200">
      {/* Gambar */}
      <div className="relative w-full h-40 overflow-hidden rounded-xl mb-2 border">
        {loading && <div className="absolute inset-0 bg-gray-200 animate-pulse" />}
        <img
          src={image}
          alt={name}
          onLoad={() => setLoading(false)}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = fallbackImage;
          }}
          className={`w-full h-full object-cover rounded-xl transition ${loading ? 'hidden' : 'block'}`}
        />

        {/* Badge stok */}
        <div className="absolute bottom-1 right-1">
          {stock <= 0 ? (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded shadow">
              Stok Habis
            </span>
          ) : (
            <span className="bg-amber-700 text-white text-xs font-semibold px-2 py-1 rounded shadow">
              Stok: {stock}
            </span>
          )}
        </div>
      </div>

      {/* Informasi */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-bold text-amber-900 break-words line-clamp-1">{name || 'Tanpa Nama'}</h3>
          <p className="text-sm text-gray-600 mt-1 break-words line-clamp-2">
            {description || 'Tidak ada deskripsi'}
          </p>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-base font-bold text-amber-700">
            Rp {parseInt(price || 0).toLocaleString('id-ID')}
          </p>
          <div className="flex gap-2">
            <button
              onClick={onEdit}
              className="p-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg shadow-sm transition"
              title="Edit"
            >
              <FaEdit className="w-4 h-4" />
            </button>
            <button
              onClick={onDelete}
              className="p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg shadow-sm transition"
              title="Hapus"
            >
              <FaTrash className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuCard;
