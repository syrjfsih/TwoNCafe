// File: ManageMenu.jsx
import { useState, useEffect } from 'react';
import MenuCard from '../components/menu/MenuCard';
import Sidebar from '../components/Sidebar';
import ModalTambahMenu from '../components/ModalTambahMenu';
import ModalEditMenu from '../components/ModalEditMenu';
import ModalHapusMenu from '../components/ModalHapusMenu';
import { FaPlus } from 'react-icons/fa';
import { supabase } from '../../services/supabase';

const ManageMenu = () => {
  const [menuList, setMenuList] = useState([]);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [showTambahModal, setShowTambahModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showHapusModal, setShowHapusModal] = useState(false);

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    const { data, error } = await supabase
      .from('menu')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) setMenuList(data);
    else console.error('Gagal fetch menu:', error);
  };

  const handleAddNew = () => setShowTambahModal(true);

  const handleEdit = (menu) => {
    setSelectedMenu(menu);
    setShowEditModal(true);
  };

  const handleDelete = (menu) => {
    setSelectedMenu(menu);
    setShowHapusModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedMenu?.id) return;
    await supabase.from('menu').delete().eq('id', selectedMenu.id);
    setShowHapusModal(false);
    fetchMenu();
  };

  const handleSaveBaru = async (menuBaru) => {
    const data = {
      name: menuBaru.nama,
      price: parseInt(menuBaru.harga),
      image: menuBaru.gambar,
      description: menuBaru.deskripsi
    };
    await supabase.from('menu').insert([data]);
    setShowTambahModal(false);
    fetchMenu();
  };

  const handleSaveEdit = async (menuData) => {
    if (!selectedMenu?.id) return;

    const updateData = {
      name: menuData.nama,
      price: parseInt(menuData.harga),
      image: menuData.gambar,
      description: menuData.deskripsi
    };

    await supabase.from('menu').update(updateData).eq('id', selectedMenu.id);
    setShowEditModal(false);
    fetchMenu();
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <main className="flex-1 p-6 relative">
        <h1 className="text-2xl font-bold text-[#702F25] mb-6">Daftar Menu</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
          {menuList.map((menu) => (
            <MenuCard
              key={menu.id}
              id={menu.id}
              image={menu.image}
              name={menu.name}
              description={menu.description}
              price={menu.price}
              onEdit={() => handleEdit(menu)}
              onDelete={() => handleDelete(menu)}
            />
          ))}
        </div>

        <button
          onClick={handleAddNew}
          className="fixed bottom-6 right-6 bg-[#702F25] text-white p-4 rounded-full shadow-lg hover:bg-[#5a241d] transition"
          title="Tambah Menu"
        >
          <FaPlus />
        </button>
      </main>

      <ModalTambahMenu
        isOpen={showTambahModal}
        onClose={() => setShowTambahModal(false)}
        onSave={handleSaveBaru}
      />

      <ModalEditMenu
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        initialData={selectedMenu}
        onSave={handleSaveEdit}
      />

      <ModalHapusMenu
        isOpen={showHapusModal}
        onClose={() => setShowHapusModal(false)}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default ManageMenu;
