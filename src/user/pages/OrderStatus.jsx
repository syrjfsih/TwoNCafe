import React, { useEffect, useRef, useState } from 'react';
import UserNavbar from '../components/NavbarUser';
import { supabase } from '../../services/supabase';
import { FaCheckCircle, FaClock, FaHourglassHalf } from 'react-icons/fa';

const OrderStatus = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const channelRef = useRef(null);

  // Ambil data awal
  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) setOrders(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Realtime listener
  useEffect(() => {
    if (!channelRef.current) {
      const channel = supabase
        .channel('realtime-orders')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'orders',
          },
          (payload) => {
            console.log('📡 Realtime Event:', payload);
            const updatedOrder = payload.new;
            if (updatedOrder) {
              setOrders((prev) => {
                const index = prev.findIndex((o) => o.id === updatedOrder.id);
                if (index !== -1) {
                  const updated = [...prev];
                  updated[index] = updatedOrder;
                  return updated;
                } else {
                  return [updatedOrder, ...prev];
                }
              });
            }
          }
        )
        .subscribe((status) => {
          console.log('🔌 Channel status:', status);
        });

      channelRef.current = channel;
    }

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, []);

  // Filtering realtime
  useEffect(() => {
    const result = orders.filter(
      (o) =>
        o.name?.toLowerCase().trim() === userName.toLowerCase().trim() &&
        o.table_number?.toString().trim() === tableNumber.toString().trim()
    );
    setFilteredOrders(result);
  }, [orders, userName, tableNumber]);

  // Cancel order handler
  const cancelOrder = async (id) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: 'dibatalkan' })
      .eq('id', id);

    if (!error) {
      console.log('✅ Pesanan dibatalkan');
      // Update langsung di state lokal biar UI langsung re-render
      setOrders((prev) =>
        prev.map((o) =>
          o.id === id ? { ...o, status: 'dibatalkan' } : o
        )
      );
    }
  };

  const renderStatusBadge = (status) => {
    let icon, color, label;
    switch (status) {
      case 'selesai':
        icon = <FaCheckCircle className="text-green-600 mr-1" />;
        color = 'bg-green-100 text-green-800';
        label = 'Selesai';
        break;
      case 'diproses':
        icon = <FaHourglassHalf className="text-blue-600 mr-1" />;
        color = 'bg-blue-100 text-blue-800';
        label = 'Diproses';
        break;
      case 'dibatalkan':
        icon = <FaClock className="text-red-600 mr-1" />;
        color = 'bg-red-100 text-red-800';
        label = 'Dibatalkan';
        break;
      default:
        icon = <FaClock className="text-gray-600 mr-1" />;
        color = 'bg-gray-100 text-gray-800';
        label = 'Menunggu';
        break;
    }

    return (
      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${color}`}>
        {icon} {label}
      </span>
    );
  };

  return (
    <>
      <UserNavbar />
      <div className="min-h-screen bg-orange-50 py-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-orange-800 mb-6 text-center">Status Pesananmu</h1>

        <div className="mb-6 flex flex-col items-center gap-3">
          <input
            type="text"
            placeholder="Nama Pemesan"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="w-full max-w-xs border px-3 py-2 rounded-md shadow-sm"
          />
          <input
            type="number"
            placeholder="Nomor Meja"
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
            className="w-full max-w-xs border px-3 py-2 rounded-md shadow-sm"
          />
        </div>

        {loading ? (
          <p className="text-center text-gray-600">⏳ Memuat data pesanan...</p>
        ) : filteredOrders.length === 0 ? (
          <p className="text-center text-gray-500">⚠️ Tidak ada pesanan ditemukan.</p>
        ) : (
          <ul className="space-y-4">
            {filteredOrders.map((order) => (
              <li key={order.id} className="bg-white rounded-xl p-4 shadow-md">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="font-semibold text-lg text-amber-900">
                    Pesanan #{order.id.slice(0, 8)}
                  </h2>
                  {renderStatusBadge(order.status)}
                </div>
                <p className="text-sm text-gray-600 mb-1">Nama: {order.name}</p>
                <p className="text-sm text-gray-600 mb-1">Meja: {order.table_number}</p>
                <p className="text-sm text-gray-600 mb-1">
                  Waktu: {new Date(order.created_at).toLocaleString('id-ID')}
                </p>
                <p className="text-sm text-gray-800 mt-2">
                  Total: <strong>Rp {order.total?.toLocaleString('id-ID')}</strong>
                </p>
                {order.status === 'menunggu' && (
                  <button
                    onClick={() => cancelOrder(order.id)}
                    className="mt-3 text-sm text-red-600 hover:underline"
                  >
                    Batalkan Pesanan
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
};

export default OrderStatus;
