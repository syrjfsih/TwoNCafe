import { useState } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';

// Komponen kartu menu admin untuk menampilkan 1 menu lengkap dengan gambar, stok, dan tombol edit/hapus
const MenuCard = ({ image, name, description, price, stock = 0, onEdit, onDelete }) => {
  const [loading, setLoading] = useState(true); // Status loading untuk gambar
  const fallbackImage = '/foto menu/default.jpg'; // Gambar default jika gagal load

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 flex flex-col h-full p-4 border border-gray-200">
      
      {/* Bagian Gambar Menu */}
      <div className="relative w-full h-40 overflow-hidden rounded-xl mb-2 border">
        {/* Placeholder saat gambar loading */}
        {loading && <div className="absolute inset-0 bg-gray-200 animate-pulse" />}

        {/* Gambar menu */}
        <img
          src={image}
          alt={name}
          onLoad={() => setLoading(false)} // Setelah gambar selesai dimuat, matikan loading
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = fallbackImage; // Jika gagal load gambar, pakai gambar fallback
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

      {/* Informasi Detail Menu */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          {/* Nama menu */}
          <h3 className="text-lg font-bold text-amber-900 break-words line-clamp-1">
            {name || 'Tanpa Nama'}
          </h3>

          {/* Deskripsi menu */}
          <p className="text-sm text-gray-600 mt-1 break-words line-clamp-2">
            {description || 'Tidak ada deskripsi'}
          </p>
        </div>

        {/* Harga + Tombol Edit Hapus */}
        <div className="mt-4 flex items-center justify-between">
          {/* Harga menu */}
          <p className="text-base font-bold text-amber-700">
            Rp {parseInt(price || 0).toLocaleString('id-ID')}
          </p>

          {/* Aksi Edit dan Hapus */}
          <div className="flex gap-2">
            {/* Tombol Edit */}
            <button
              onClick={onEdit}
              className="p-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg shadow-sm transition"
              title="Edit"
            >
              <FaEdit className="w-4 h-4" />
            </button>

            {/* Tombol Hapus */}
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
