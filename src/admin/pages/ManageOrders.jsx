import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import Sidebar from '../components/Sidebar';
import ModalUbahStatus from '../components/ModalUbahStatus';
import ModalHapusPesanan from '../components/ModalHapusPesanan';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { CalendarDaysIcon, ArrowLeftCircleIcon } from '@heroicons/react/24/solid';

const ManageOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [filterStatus, setFilterStatus] = useState('Semua');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [showAll, setShowAll] = useState(false); // ⬅️ NEW STATE

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate('/admin/login');
    });
  }, [navigate]);

  const fetchOrders = async () => {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('orders')
      .select(`
      id,
      name,
      total,
      status,
      table_number,
      created_at,
      order_items (
        id,
        quantity,
        price,
        menu_id,
        menu:menu_id (name, stock)
      )
    `)
      .order('created_at', { ascending: false });

    if (error) {
      toast.dismiss();
      toast.error('Gagal memuat pesanan');
      console.error(error);
      return;
    }

    // Proses pembatalan otomatis
    for (const order of data) {
      if (order.status === 'Menunggu' && isMoreThan30Mins(order.created_at)) {
        // 1. Update status ke Dibatalkan
        await supabase
          .from('orders')
          .update({ status: 'Dibatalkan' })
          .eq('id', order.id);

        // 2. Tambah kembali stok menu
        for (const item of order.order_items) {
          await supabase.rpc('increment_menu_stock', {
            menu_id_param: item.menu_id,
            quantity_param: item.quantity,
          });
        }

        console.log(`⏱️ Pesanan ID ${order.id} otomatis dibatalkan`);
      }
    }

    const filtered = data.filter(order => {
      const orderDate = new Date(order.created_at).toISOString().split('T')[0];
      if (!showAll) {
        return orderDate === today && order.status !== 'Selesai';
      }
      return true;
    });

    const formatted = filtered.map(order => ({
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

  // Fungsi bantu: Cek apakah waktu lebih dari 30 menit lalu
  const isMoreThan30Mins = (createdAt) => {
    const now = new Date();
    const createdTime = new Date(createdAt);
    const diffMs = now - createdTime;
    return diffMs > 30 * 60 * 1000; // 30 menit dalam milidetik
  };

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
        fetchOrders();
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  useEffect(() => {
    fetchOrders(); // Refresh saat toggle showAll
  }, [showAll]);

  const handleOpenModal = (id) => {
    setSelectedOrderId(id);
    setShowModal(true);
  };

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

  const handleDeleteClick = (id) => {
    setSelectedOrderId(id);
    setShowDeleteModal(true);
  };

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

  const filteredOrders = orders.filter(order =>
    filterStatus === 'Semua' ? true : order.status === filterStatus
  );

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <main className="flex-1 p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-[#702F25]">
            Pesanan Masuk {showAll ? '(Semua)' : 'Hari Ini'}
          </h1>

          <button
            onClick={() => setShowAll(prev => !prev)}
            className="flex items-center gap-2 text-sm font-medium px-4 py-2 border border-[#702F25] text-[#702F25] rounded-md hover:bg-[#702F25] hover:text-white transition-all duration-200"
          >
            {showAll ? (
              <>
                <span className="text-lg">⬅️</span> Sembunyikan Hari Lain
              </>
            ) : (
              <>
                <span className="text-lg">📅</span> Lihat Semua Hari
              </>
            )}
          </button>
        </div>

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
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${order.status === 'Selesai'
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

      <ModalUbahStatus
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleStatusChange}
        currentStatus={orders.find((o) => o.id === selectedOrderId)?.status || 'Menunggu'}
        orderId={selectedOrderId}
      />

      <ModalHapusPesanan
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
      />

      <ToastContainer />
    </div>
  );
};

export default ManageOrders;
