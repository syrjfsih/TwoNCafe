// Import React hook untuk state dan efek samping
import { useState, useEffect } from 'react';
// Import komponen MenuCard dan modal
import MenuCard from '../components/menu/MenuCard';
import Sidebar from '../components/Sidebar';
import ModalTambahMenu from '../components/ModalTambahMenu';
import ModalEditMenu from '../components/ModalEditMenu';
import ModalHapusMenu from '../components/ModalHapusMenu';
// Import icon tombol tambah
import { FaPlus } from 'react-icons/fa';
// Import koneksi Supabase
import { supabase } from '../../services/supabase';

const ManageMenu = () => {
  // State untuk menyimpan semua data menu
  const [menuList, setMenuList] = useState([]);
  // State untuk menyimpan menu yang sedang dipilih untuk edit atau hapus
  const [selectedMenu, setSelectedMenu] = useState(null);
  // State kontrol modal tampil/tidak
  const [showTambahModal, setShowTambahModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showHapusModal, setShowHapusModal] = useState(false);

  // Saat komponen pertama kali dimuat, ambil data menu
  useEffect(() => {
    fetchMenu();
  }, []);

  // Fungsi untuk mengambil data menu dari Supabase
  const fetchMenu = async () => {
    const { data, error } = await supabase
      .from('menu')
      .select('*')
      .eq('is_deleted', false) // hanya ambil menu yang belum dihapus
      .order('created_at', { ascending: false });

    if (!error) setMenuList(data);
    else console.error('Gagal fetch menu:', error);
  };

  // Menampilkan modal tambah menu baru
  const handleAddNew = () => setShowTambahModal(true);

  // Menyiapkan data menu yang akan diedit dan menampilkan modal edit
  const handleEdit = (menu) => {
    setSelectedMenu(menu);
    setShowEditModal(true);
  };

  // Menyiapkan data menu yang akan dihapus dan menampilkan modal hapus
  const handleDelete = (menu) => {
    setSelectedMenu(menu);
    setShowHapusModal(true);
  };

  // Konfirmasi hapus menu (soft delete)
  const confirmDelete = async () => {
    if (!selectedMenu?.id) return;

    const { error } = await supabase
      .from('menu')
      .update({ is_deleted: true }) // soft delete, bukan benar-benar hapus
      .eq('id', selectedMenu.id);

    if (error) console.error('Gagal soft delete menu:', error);

    setShowHapusModal(false);
    fetchMenu(); // refresh data
  };

  // Simpan menu baru ke Supabase
  const handleSaveBaru = async (menuBaru) => {
    const data = {
      name: menuBaru.nama,
      price: parseInt(menuBaru.harga),
      image: menuBaru.gambar,
      description: menuBaru.deskripsi,
      kategori: menuBaru.kategori?.toLowerCase(),
      stock: parseInt(menuBaru.stok || 0),
      aktif: true,
      is_deleted: false,
    };
    await supabase.from('menu').insert([data]);
    setShowTambahModal(false);
    fetchMenu();
  };

  // Simpan perubahan dari menu yang diedit
  const handleSaveEdit = async (menuData) => {
    if (!selectedMenu?.id) return;

    const updateData = {
      name: menuData.nama,
      price: parseInt(menuData.harga),
      image: menuData.gambar,
      description: menuData.deskripsi,
      kategori: menuData.kategori?.toLowerCase(),
      stock: parseInt(menuData.stok || 0),
    };

    await supabase.from('menu').update(updateData).eq('id', selectedMenu.id);
    setShowEditModal(false);
    fetchMenu();
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar navigasi kiri */}
      <Sidebar />

      {/* Konten utama */}
      <main className="flex-1 p-6 relative">
        <h1 className="text-2xl font-bold text-[#702F25] mb-6">Daftar Menu</h1>

        {/* Tampilkan daftar kartu menu */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
          {menuList.map((menu) => (
            <MenuCard
              key={menu.id}
              id={menu.id}
              image={menu.image}
              name={menu.name}
              description={menu.description}
              price={menu.price}
              stock={menu.stock}
              onEdit={() => handleEdit(menu)}
              onDelete={() => handleDelete(menu)}
            />
          ))}
        </div>

        {/* Tombol tambah menu mengambang di kanan bawah */}
        <button
          onClick={handleAddNew}
          className="fixed bottom-6 right-6 bg-[#702F25] text-white p-4 rounded-full shadow-lg hover:bg-[#5a241d] transition"
          title="Tambah Menu"
        >
          <FaPlus />
        </button>
      </main>

      {/* Modal Tambah Menu */}
      <ModalTambahMenu
        isOpen={showTambahModal}
        onClose={() => setShowTambahModal(false)}
        onSave={handleSaveBaru}
      />

      {/* Modal Edit Menu */}
      <ModalEditMenu
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        initialData={selectedMenu}
        onSave={handleSaveEdit}
      />

      {/* Modal Konfirmasi Hapus */}
      <ModalHapusMenu
        isOpen={showHapusModal}
        onClose={() => setShowHapusModal(false)}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default ManageMenu;
