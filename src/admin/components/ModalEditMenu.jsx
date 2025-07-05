import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';

const ModalEditMenu = ({ isOpen, onClose, initialData, onUpdated }) => {
  const [form, setForm] = useState({
    nama: '',
    harga: '',
    deskripsi: '',
    gambar: null,
    kategori: '',
    stok: '',
    previewUrl: ''
  });

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

  const handleChange = (e) => {
    const { name, value, files } = e.target;
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

  const handleSubmit = async () => {
    if (!form.nama || !form.harga || !form.kategori || !initialData?.id) {
      alert('⚠️ Nama, Harga, Kategori dan ID menu wajib diisi!');
      return;
    }

    let finalImageUrl = form.previewUrl;

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

      const { data: publicUrl } = supabase.storage
        .from('menu-images')
        .getPublicUrl(filePath);

      if (!publicUrl?.publicUrl) {
        alert("❌ Gagal ambil URL gambar baru");
        return;
      }

      finalImageUrl = publicUrl.publicUrl;
    }

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

    onUpdated?.();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-amber-900 mb-4">Edit Menu</h2>

        <label className="block text-sm mb-1">Nama Menu</label>
        <input
          name="nama"
          value={form.nama}
          onChange={handleChange}
          className="w-full mb-3 border px-3 py-2 rounded text-sm"
        />

        <label className="block text-sm mb-1">Harga</label>
        <input
          name="harga"
          type="number"
          value={form.harga}
          onChange={handleChange}
          className="w-full mb-3 border px-3 py-2 rounded text-sm"
        />

        <label className="block text-sm mb-1">Stok</label>
        <input
          name="stok"
          type="number"
          value={form.stok}
          onChange={handleChange}
          className="w-full mb-3 border px-3 py-2 rounded text-sm"
        />

        <label className="block text-sm mb-1">Deskripsi</label>
        <textarea
          name="deskripsi"
          value={form.deskripsi}
          onChange={handleChange}
          className="w-full mb-3 border px-3 py-2 rounded text-sm"
        />

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

        <label className="block text-sm mb-1">Gambar Baru (opsional)</label>
        <input
          name="gambar"
          type="file"
          accept="image/*"
          onChange={handleChange}
          className="w-full text-sm mb-2"
        />

        {form.previewUrl && (
          <img
            src={form.previewUrl}
            alt="Preview"
            className="w-full h-40 object-cover rounded border mb-4"
          />
        )}

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
