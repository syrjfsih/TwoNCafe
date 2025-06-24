import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import UserNavbar from '../components/NavbarUser';
import {
  FaClock,
  FaCheckCircle,
  FaSpinner,
} from 'react-icons/fa';

const StatusBadge = ({ status }) => {
  let color = 'text-yellow-400';
  let icon = <FaClock />;

  if (status === 'Diproses') {
    color = 'text-blue-400';
    icon = <FaSpinner className="animate-spin" />;
  } else if (status === 'Selesai') {
    color = 'text-green-600';
    icon = <FaCheckCircle />;
  }

  return (
    <span
      className={`flex items-center gap-2 px-3 py-1 text-sm rounded-full border ${color} border-current font-semibold`}
    >
      {icon}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const OrderStatus = () => {
  const [name, setName] = useState('');
  const [table, setTable] = useState('');
  const [order, setOrder] = useState(null);
  const [notFound, setNotFound] = useState(false);

  const fetchOrder = async () => {
    if (!name.trim() || !table.trim()) return;

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('name', name.trim())
      .eq('table_number', parseInt(table))
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      setOrder(null);
      setNotFound(true);
    } else {
      setOrder(data);
      setNotFound(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      fetchOrder();
    }, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, table]);

  return (
    <>
      <UserNavbar />
      <main className="min-h-screen bg-amber-50 py-12 px-4 sm:px-8 md:px-20 lg:px-40">
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-amber-900 mb-8">
          Status Pesananmu
        </h1>

        <div className="max-w-md mx-auto space-y-4 mb-6">
          <input
            type="text"
            placeholder="Nama Pemesan"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border rounded-md shadow-sm focus:ring focus:ring-amber-300"
          />
          <input
            type="number"
            placeholder="Nomor Meja"
            value={table}
            onChange={(e) => setTable(e.target.value)}
            className="w-full px-4 py-2 border rounded-md shadow-sm focus:ring focus:ring-amber-300"
          />
          <button
            onClick={fetchOrder}
            className="w-full bg-amber-900 text-white py-2 rounded-md hover:bg-amber-800 transition"
          >
            Cek Status
          </button>
        </div>

        {order && (
          <div className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow-md border border-gray-200">
            <p className="text-lg font-semibold text-amber-900 mb-2">
              Pesanan #{order.id.slice(0, 8)}
            </p>
            <p className="text-sm text-gray-800 mb-1">Nama: {order.name}</p>
            <p className="text-sm text-gray-800 mb-1">
              Meja: {order.table_number}
            </p>
            <p className="text-sm text-gray-800 mb-1">
              Waktu: {new Date(order.created_at).toLocaleString('id-ID')}
            </p>
            <p className="text-sm text-gray-800 mb-2 font-semibold">
              Total: Rp {order.total.toLocaleString('id-ID')}
            </p>
            <div className="text-right">
              <StatusBadge status={order.status || 'menunggu'} />
            </div>
          </div>
        )}

        {notFound && (
          <div className="text-center text-yellow-700 font-medium mt-6">
            ⚠️ Tidak ada pesanan ditemukan.
          </div>
        )}
      </main>
    </>
  );
};

export default OrderStatus;
