import React, { useState } from 'react';
import { supabase } from '../../services/supabase'; // Supabase client untuk akses DB & storage
import { toast } from 'react-toastify'; // Untuk notifikasi user
import { Slide } from 'react-toastify'; // Transisi slide pada toast

const ModalTambahMenu = ({ isOpen, onClose, onSave }) => {
  // State untuk menampung nilai input form menu
  const [form, setForm] = useState({
    nama: '',
    harga: '',
    deskripsi: '',
    gambar: null,
    kategori: '',
    stok: '',
  });

  const [isLoading, setIsLoading] = useState(false); // Menandakan proses loading saat submit

  // Handle perubahan input form
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'gambar') {
      // Jika input gambar, simpan file-nya langsung
      setForm((prev) => ({ ...prev, gambar: files[0] }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Fungsi untuk menyimpan data menu ke Supabase
  const handleSubmit = async () => {
    // Validasi input wajib
    if (!form.nama || !form.harga || !form.gambar || !form.kategori || !form.stok) {
      toast.error('⚠️ Semua field wajib diisi, termasuk stok!', { transition: Slide });
      return;
    }

    if (parseInt(form.stok) < 0) {
      toast.error('🚫 Stok tidak boleh kurang dari 0!', { transition: Slide });
      return;
    }

    setIsLoading(true); // Aktifkan indikator loading

    try {
      // Upload gambar ke Supabase Storage
      const fileName = `${Date.now()}-${form.gambar.name}`; // Nama file unik berdasarkan waktu
      const filePath = `menu/${fileName}`; // Path penyimpanan
      const { error: uploadError } = await supabase.storage
        .from('menu-images')
        .upload(filePath, form.gambar);

      if (uploadError) throw new Error('Gagal upload gambar');

      // Ambil URL gambar publik
      const { data: urlData } = supabase.storage
        .from('menu-images')
        .getPublicUrl(filePath);

      // Siapkan data untuk insert ke database
      const insertData = {
        name: form.nama,
        price: parseInt(form.harga),
        description: form.deskripsi,
        image: urlData.publicUrl,
        kategori: form.kategori.toLowerCase(),
        stock: parseInt(form.stok),
      };

      // Insert ke tabel menu
      const { error: insertError } = await supabase.from('menu').insert([insertData]);
      if (insertError) throw new Error('Gagal menambahkan menu');

      // Tampilkan notifikasi berhasil
      toast.success('✅ Menu berhasil ditambahkan!', { icon: '🧾', transition: Slide });
      onSave(insertData); // Panggil callback untuk update list
      setForm({ nama: '', harga: '', deskripsi: '', gambar: null, kategori: '', stok: '' }); // Reset form
      onClose(); // Tutup modal
    } catch (err) {
      // Jika error, tampilkan toast
      toast.error(`❌ ${err.message}`, { transition: Slide });
    } finally {
      setIsLoading(false); // Matikan loading apapun hasilnya
    }
  };

  // Jika modal tidak ditampilkan, jangan render apapun
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-amber-900 mb-4">Tambah Menu</h2>

        {/* Input Nama Menu */}
        <label className="block text-sm mb-1">Nama Menu</label>
        <input
          name="nama"
          value={form.nama}
          onChange={handleChange}
          className="w-full mb-3 border px-3 py-2 rounded text-sm"
        />

        {/* Input Harga */}
        <label className="block text-sm mb-1">Harga</label>
        <input
          name="harga"
          type="number"
          value={form.harga}
          onChange={handleChange}
          className="w-full mb-3 border px-3 py-2 rounded text-sm"
        />

        {/* Input Stok */}
        <label className="block text-sm mb-1">Stok</label>
        <input
          name="stok"
          type="number"
          value={form.stok}
          onChange={handleChange}
          className="w-full mb-3 border px-3 py-2 rounded text-sm"
        />

        {/* Input Deskripsi */}
        <label className="block text-sm mb-1">Deskripsi</label>
        <textarea
          name="deskripsi"
          value={form.deskripsi}
          onChange={handleChange}
          className="w-full mb-3 border px-3 py-2 rounded text-sm"
        />

        {/* Input Kategori */}
        <label className="block text-sm mb-1">Kategori</label>
        <select
          name="kategori"
          value={form.kategori}
          onChange={handleChange}
          className="w-full mb-3 border px-3 py-2 rounded text-sm"
        >
          <option value="">🍽️ Pilih Kategori</option>
          <option value="makanan">🍕 Makanan</option>
          <option value="minuman">🥤 Minuman</option>
        </select>

        {/* Input Gambar */}
        <label className="block text-sm mb-1">Upload Gambar</label>
        <input
          name="gambar"
          type="file"
          accept="image/*"
          onChange={handleChange}
          className="w-full mb-4 text-sm"
        />

        {/* Tombol Aksi */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="text-sm text-gray-600 hover:underline"
            disabled={isLoading}
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className={`bg-amber-900 text-white px-4 py-2 rounded text-sm font-semibold flex items-center justify-center gap-2 transition ${
              isLoading ? 'opacity-60 cursor-not-allowed' : 'hover:bg-amber-800'
            }`}
          >
            {/* Spinner loading */}
            {isLoading && (
              <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z" />
              </svg>
            )}
            {isLoading ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalTambahMenu;
