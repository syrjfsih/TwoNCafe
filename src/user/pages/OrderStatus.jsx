import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
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

  if (status === 'diproses') {
    color = 'text-blue-400';
    icon = <FaSpinner className="animate-spin" />;
  } else if (status === 'selesai') {
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
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const namaQuery = params.get('nama') || '';
  const mejaQuery = params.get('meja') || '';

  const [name, setName] = useState(namaQuery);
  const [table, setTable] = useState(mejaQuery);
  const [order, setOrder] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchOrder = async () => {
    if (!name.trim() || !table.trim()) return;

    setLoading(true);

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

    setLoading(false);
  };

  useEffect(() => {
    if (name && table) fetchOrder();
    const interval = setInterval(fetchOrder, 10000); // Auto refresh setiap 10 detik
    return () => clearInterval(interval);
  }, [name, table]);

  return (
    <>
      <UserNavbar />
      <main className="min-h-screen bg-amber-50 py-12 px-4 sm:px-8 md:px-20 lg:px-40">
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-amber-900 mb-8">
          Status Pesananmu
        </h1>

        {/* Input manual hanya jika URL tidak valid */}
        {(!namaQuery || !mejaQuery) && (
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
              className="w-full px-4 py-2 border rounded-md shadow-sm"
            />
            <button
              onClick={fetchOrder}
              className="w-full bg-amber-900 text-white py-2 rounded-md hover:bg-amber-800 transition"
            >
              Cek Status
            </button>
          </div>
        )}

        {loading && (
          <div className="text-center text-gray-500 font-medium mt-6">
            ⏳ Memuat pesanan...
          </div>
        )}

        {!loading && order && (
          <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-md border border-gray-200 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-lg font-bold text-amber-900">
                  Pesanan #{order.id.slice(0, 8)}
                </p>
                <p className="text-sm text-gray-700">
                  Dibuat: {new Date(order.created_at).toLocaleString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <StatusBadge status={order.status || 'menunggu'} />
            </div>

            <div className="text-sm text-gray-800 space-y-1">
              <p><span className="font-medium">Nama Pemesan:</span> {order.name}</p>
              <p><span className="font-medium">Meja:</span> {order.table_number}</p>
              {order.payment_method && (
                <p><span className="font-medium">Metode Pembayaran:</span> {order.payment_method}</p>
              )}
            </div>

            <div>
              <p className="font-semibold text-amber-900 mb-2">Rincian Pesanan:</p>
              <ul className="divide-y divide-gray-200 text-sm">
                {(order.order_items || []).map((item, index) => (
                  <li key={index} className="py-2 flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-800">{item.name}</p>
                      <p className="text-xs text-gray-500">
                        {item.quantity} x Rp {item.price.toLocaleString('id-ID')}
                      </p>
                    </div>
                    <p className="text-amber-800 font-semibold">
                      Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="text-right text-lg font-bold text-amber-900 border-t pt-4">
              Total: Rp {order.total.toLocaleString('id-ID')}
            </div>
          </div>
        )}

        {!loading && notFound && (
          <div className="text-center text-yellow-700 font-medium mt-6">
            ⚠️ Tidak ada pesanan ditemukan.
          </div>
        )}
      </main>
    </>
  );
};

export default OrderStatus;
