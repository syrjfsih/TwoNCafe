import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';

// Komponen untuk menampilkan dan mengedit data menu
const ModalEditMenu = ({ isOpen, onClose, initialData, onUpdated }) => {
  // State untuk menyimpan form menu yang sedang diedit
  const [form, setForm] = useState({
    nama: '',
    harga: '',
    deskripsi: '',
    gambar: null,
    kategori: '',
    stok: '',
    previewUrl: '' // preview gambar
  });

  // Saat modal dibuka dan ada data awal, isi form dengan data tersebut
  useEffect(() => {
    if (isOpen && initialData) {
      setForm({
        nama: initialData.nama || initialData.name || '',
        harga: initialData.harga || initialData.price || '',
        deskripsi: initialData.deskripsi || initialData.description || '',
        gambar: null,
        kategori: initialData.kategori || '',
        stok: initialData.stok || initialData.stock || 0,
        previewUrl: initialData.image || initialData.gambar || ''
      });
    }
  }, [isOpen, initialData]);

  // Fungsi untuk menangani input form
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    // Jika input gambar, simpan file dan preview
    if (name === 'gambar' && files.length > 0) {
      const file = files[0];
      setForm((prev) => ({
        ...prev,
        gambar: file,
        previewUrl: URL.createObjectURL(file)
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Fungsi untuk menyimpan perubahan ke database
  const handleSubmit = async () => {
    // Validasi input wajib
    if (!form.nama || !form.harga || !form.kategori || !initialData?.id) {
      alert('⚠️ Nama, Harga, Kategori dan ID menu wajib diisi!');
      return;
    }

    let finalImageUrl = form.previewUrl;

    // Jika user memilih gambar baru, upload ke Supabase Storage
    if (form.gambar) {
      const fileName = `${Date.now()}-${form.gambar.name}`;
      const filePath = `menu/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('menu-images')
        .upload(filePath, form.gambar, { upsert: true });

      if (uploadError) {
        console.error("❌ Upload error:", uploadError);
        alert('Gagal upload gambar baru!');
        return;
      }

      // Ambil URL gambar yang bisa diakses publik
      const { data: publicUrl } = supabase.storage
        .from('menu-images')
        .getPublicUrl(filePath);

      if (!publicUrl?.publicUrl) {
        alert("❌ Gagal ambil URL gambar baru");
        return;
      }

      finalImageUrl = publicUrl.publicUrl;
    }

    // Simpan data update ke Supabase
    const { error } = await supabase
      .from('menu')
      .update({
        name: form.nama,
        price: parseInt(form.harga),
        description: form.deskripsi,
        kategori: form.kategori.toLowerCase(),
        stock: parseInt(form.stok || 0),
        image: finalImageUrl
      })
      .eq('id', initialData.id);

    if (error) {
      alert('❌ Gagal menyimpan perubahan!');
      return;
    }

    // Jika ada callback sukses, panggil
    onUpdated?.();
    onClose(); // Tutup modal
  };

  // Jika modal tidak dibuka, kembalikan null (tidak render apa-apa)
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-amber-900 mb-4">Edit Menu</h2>

        {/* Input nama menu */}
        <label className="block text-sm mb-1">Nama Menu</label>
        <input
          name="nama"
          value={form.nama}
          onChange={handleChange}
          className="w-full mb-3 border px-3 py-2 rounded text-sm"
        />

        {/* Input harga */}
        <label className="block text-sm mb-1">Harga</label>
        <input
          name="harga"
          type="number"
          value={form.harga}
          onChange={handleChange}
          className="w-full mb-3 border px-3 py-2 rounded text-sm"
        />

        {/* Input stok */}
        <label className="block text-sm mb-1">Stok</label>
        <input
          name="stok"
          type="number"
          value={form.stok}
          onChange={handleChange}
          className="w-full mb-3 border px-3 py-2 rounded text-sm"
        />

        {/* Input deskripsi */}
        <label className="block text-sm mb-1">Deskripsi</label>
        <textarea
          name="deskripsi"
          value={form.deskripsi}
          onChange={handleChange}
          className="w-full mb-3 border px-3 py-2 rounded text-sm"
        />

        {/* Input kategori */}
        <label className="block text-sm mb-1">Kategori</label>
        <select
          name="kategori"
          value={form.kategori}
          onChange={handleChange}
          className="w-full mb-3 border px-3 py-2 rounded text-sm"
        >
          <option value="">Pilih Kategori</option>
          <option value="makanan">Makanan</option>
          <option value="minuman">Minuman</option>
        </select>

        {/* Upload gambar baru */}
        <label className="block text-sm mb-1">Gambar Baru (opsional)</label>
        <input
          name="gambar"
          type="file"
          accept="image/*"
          onChange={handleChange}
          className="w-full text-sm mb-2"
        />

        {/* Preview gambar */}
        {form.previewUrl && (
          <img
            src={form.previewUrl}
            alt="Preview"
            className="w-full h-40 object-cover rounded border mb-4"
          />
        )}

        {/* Tombol aksi */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="text-sm text-gray-600 hover:underline"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            className="bg-amber-900 hover:bg-amber-800 text-white px-4 py-2 rounded text-sm font-semibold"
          >
            Simpan Perubahan
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalEditMenu;
