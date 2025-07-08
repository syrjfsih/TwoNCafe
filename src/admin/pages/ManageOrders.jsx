// File: src/admin/pages/ManageOrders.jsx

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase'; // Koneksi ke supabase
import Sidebar from '../components/Sidebar';
import ModalUbahStatus from '../components/ModalUbahStatus';
import ModalHapusPesanan from '../components/ModalHapusPesanan';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ManageOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]); // Menyimpan daftar pesanan
  const [filterStatus, setFilterStatus] = useState('Semua'); // Menyimpan filter status saat ini
  const [showModal, setShowModal] = useState(false); // Toggle modal ubah status
  const [showDeleteModal, setShowDeleteModal] = useState(false); // Toggle modal konfirmasi hapus
  const [selectedOrderId, setSelectedOrderId] = useState(null); // Menyimpan ID pesanan yang dipilih

  // 🔐 Cek apakah admin sudah login
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate('/admin/login');
    });
  }, [navigate]);

  // 🔄 Ambil dan format data pesanan dari Supabase
  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        id,
        name,
        total,
        status,
        table_number,
        order_items (
          menu_id,
          quantity,
          price,
          menu:menu_id (name)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      toast.dismiss();
      toast.error('Gagal memuat pesanan');
      console.error(error);
      return;
    }

    // Format agar menu menjadi satu string deskriptif
    const formatted = data.map(order => ({
      id: order.id,
      nama: order.name,
      total: order.total,
      status: order.status,
      meja: order.table_number,
      menu: order.order_items
        .map(item => `${item.menu?.name || 'Menu'} x${item.quantity}`)
        .join(', ')
    }));

    setOrders(formatted);
  };

  // 🔁 Aktifkan realtime listener Supabase untuk perubahan data pesanan
  useEffect(() => {
    fetchOrders();

    const channel = supabase
      .channel('realtime-orders-status')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'orders',
      }, (payload) => {
        console.log('📡 Realtime update:', payload);
        fetchOrders(); // Refresh data
      })
      .subscribe((status) => {
        console.log('🟢 WebSocket status:', status);
      });

    return () => {
      channel.unsubscribe();
    };
  }, []);

  // 🛠️ Buka modal ubah status
  const handleOpenModal = (id) => {
    setSelectedOrderId(id);
    setShowModal(true);
  };

  // ✅ Simpan perubahan status ke database
  const handleStatusChange = async (newStatus) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', selectedOrderId);

    if (error) {
      toast.dismiss();
      toast.error('Gagal mengubah status');
      console.error(error);
      return;
    }

    toast.dismiss();
    toast.success(`Status berhasil diubah menjadi "${newStatus}"`);
    setShowModal(false);
    fetchOrders();
  };

  // 🗑️ Buka modal hapus pesanan
  const handleDeleteClick = (id) => {
    setSelectedOrderId(id);
    setShowDeleteModal(true);
  };

  // ❌ Hapus data pesanan dan item terkait dari database
  const confirmDelete = async () => {
    const { error: itemsError } = await supabase
      .from('order_items')
      .delete()
      .eq('order_id', selectedOrderId);

    const { error: orderError } = await supabase
      .from('orders')
      .delete()
      .eq('id', selectedOrderId);

    if (itemsError || orderError) {
      toast.dismiss();
      toast.error('Gagal menghapus pesanan');
      console.error(itemsError || orderError);
      return;
    }

    toast.dismiss();
    toast.success('Pesanan berhasil dihapus!');
    setShowDeleteModal(false);
    fetchOrders();
  };

  // 🔍 Filter berdasarkan status
  const filteredOrders = orders.filter(order =>
    filterStatus === 'Semua' ? true : order.status === filterStatus
  );

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar /> {/* Navigasi sidebar */}

      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-6 text-[#702F25]">Pesanan Masuk</h1>

        {/* Filter status */}
        <div className="mb-4 flex justify-between items-center">
          <div>
            <label className="text-sm font-medium text-gray-700 mr-2">Filter Status:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            >
              <option value="Semua">Semua</option>
              <option value="Menunggu">Menunggu</option>
              <option value="Diproses">Diproses</option>
              <option value="Selesai">Selesai</option>
            </select>
          </div>
        </div>

        {/* Tabel daftar pesanan */}
        <div className="overflow-x-auto bg-white rounded-xl shadow">
          <table className="w-full table-auto text-sm text-left text-gray-600">
            <thead className="bg-[#702F25] text-white">
              <tr>
                <th className="px-4 py-3">No</th>
                <th className="px-4 py-3">Nama</th>
                <th className="px-4 py-3">Meja</th>
                <th className="px-4 py-3">Menu</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order, index) => (
                <tr key={order.id} className="border-t hover:bg-orange-50 transition">
                  <td className="px-4 py-2">{index + 1}</td>
                  <td className="px-4 py-2">{order.nama}</td>
                  <td className="px-4 py-2">Meja {order.meja}</td>
                  <td className="px-4 py-2">{order.menu}</td>
                  <td className="px-4 py-2">Rp. {order.total.toLocaleString()}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        order.status === 'Selesai'
                          ? 'bg-green-100 text-green-700'
                          : order.status === 'Diproses'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-center flex justify-center gap-2">
                    <button
                      onClick={() => handleOpenModal(order.id)}
                      className="bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold px-3 py-1 rounded-md text-xs"
                    >
                      Ubah
                    </button>
                    <button
                      onClick={() => handleDeleteClick(order.id)}
                      className="bg-red-100 hover:bg-red-200 text-red-700 font-semibold px-3 py-1 rounded-md text-xs"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-gray-400">
                    Tidak ada pesanan dengan status "{filterStatus}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Modal untuk ubah status pesanan */}
      <ModalUbahStatus
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleStatusChange}
        currentStatus={orders.find((o) => o.id === selectedOrderId)?.status || 'Menunggu'}
        orderId={selectedOrderId}
      />

      {/* Modal konfirmasi hapus */}
      <ModalHapusPesanan
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
      />

      <ToastContainer /> {/* Container notifikasi toast */}
    </div>
  );
};

export default ManageOrders;
