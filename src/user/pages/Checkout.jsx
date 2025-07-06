""// File: src/user/pages/Checkout.jsx
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaMoneyBillWave, FaQrcode } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { supabase } from '../../services/supabase';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { cart = [] } = location.state || {};
  const [name, setName] = useState('');
  const [table, setTable] = useState('');
  const [type, setType] = useState('');
  const [method, setMethod] = useState('');
  const [error, setError] = useState('');
  const [activeTables, setActiveTables] = useState([]);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const lockedTable = localStorage.getItem('nomorMeja');
  const isLocked = !!lockedTable;

  useEffect(() => {
    const mejaFromURL = new URLSearchParams(window.location.search).get('meja');
    if (mejaFromURL) {
      setTable(mejaFromURL);
      localStorage.setItem('nomorMeja', mejaFromURL);
    }
    fetchActiveTables();
  }, []);

  useEffect(() => {
    if (table) {
      const url = new URL(window.location);
      url.searchParams.set('meja', table);
      window.history.replaceState({}, '', url);
    }
  }, [table]);

  const fetchActiveTables = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('table_number')
      .is('ended_at', null);

    if (!error && data) {
      const aktif = [...new Set(data.map((d) => String(d.table_number)))];
      setActiveTables(aktif);
    }
  };

  const handleCheckout = async () => {
    if (!name.trim() || !table || !type || !method) {
      toast.error('Lengkapi semua data terlebih dahulu.');
      return;
    }

    const parsedTable = parseInt(table);
    if (!parsedTable || isNaN(parsedTable)) {
      toast.error('Nomor meja tidak valid.');
      return;
    }

    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        name,
        table_number: parsedTable,
        order_type: type,
        payment_method: method,
        total,
        created_at: new Date().toISOString(),
        status: 'menunggu',
        ended_at: null
      })
      .select()
      .single();

    if (orderError) {
      toast.error('Gagal menyimpan pesanan.');
      return;
    }

    const itemsToInsert = cart.map((item) => ({
      order_id: orderData.id,
      menu_id: item.id,
      quantity: item.quantity,
      price: item.price,
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(itemsToInsert);
    if (itemsError) {
      toast.error('Gagal menyimpan detail pesanan.');
      return;
    }

    for (let item of cart) {
      await supabase
        .from('menu')
        .update({ stock: item.stock - item.quantity })
        .eq('id', item.id);
    }

    localStorage.removeItem('nomorMeja');
    toast.success('✅ Pesanan berhasil dikonfirmasi!');
    navigate(`/status?nama=${encodeURIComponent(name)}&meja=${parsedTable}`, {
      state: { type, method, cart, total }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-amber-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto bg-white rounded-xl shadow-2xl p-8 border border-amber-200">
        <h2 className="text-xl font-bold text-amber-900 mb-6 text-center">Checkout Pesanan</h2>

        <label className="block text-sm font-medium text-gray-700">Nama Pemesan</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Masukkan nama lengkap"
          className="w-full border px-3 py-2 rounded-lg text-sm mb-4 bg-gray-50"
        />

        <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Meja</label>
        <div className="grid grid-cols-5 gap-2 mb-4">
          {Array.from({ length: 30 }, (_, i) => {
            const no = (i + 1).toString();
            const selected = table === no;
            const isActive = activeTables.includes(no);
            const isCurrent = lockedTable === no;

            return (
              <button
                key={no}
                onClick={() => setTable(no)}
                disabled={isActive && !isCurrent}
                className={`py-2 text-xs rounded font-semibold border transition duration-200
                  ${isCurrent ? 'bg-amber-800 text-white border-amber-800' : ''}
                  ${isActive && !isCurrent ? 'bg-amber-300 text-white border-amber-300 cursor-not-allowed' : ''}
                  ${!selected && !isActive && !isCurrent ? 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed' : ''}
                  ${selected && !isCurrent ? 'bg-amber-600 text-white border-amber-600' : ''}`}
              >
                Meja {no}
              </button>
            );
          })}
        </div>

        <label className="block text-sm font-medium text-gray-700 mb-1">Tipe Pemesanan</label>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <button
            onClick={() => setType('takeaway')}
            className={`p-4 rounded-lg shadow text-center border transition hover:scale-105 flex flex-col items-center
              ${type === 'takeaway' ? 'bg-amber-800 text-white border-amber-800' : 'bg-white text-amber-900 border-amber-300'}`}
          >
            <img
              src="/foto-icon/take-away.png"
              alt="Take Away"
              className={`w-8 h-8 mx-auto mb-1 transition ${type === 'takeaway' ? 'brightness-0 invert' : ''
                }`}
            />
            Take Away
          </button>
          <button
            onClick={() => setType('dinein')}
            className={`p-4 rounded-lg shadow text-center border transition hover:scale-105 flex flex-col items-center
              ${type === 'dinein' ? 'bg-amber-800 text-white border-amber-800' : 'bg-white text-amber-900 border-amber-300'}`}
          >
            <img
              src="/foto-icon/dine-in.png"
              alt="Dine In"
              className={`w-8 h-8 mx-auto mb-1 transition ${type === 'dinein' ? 'brightness-0 invert' : ''
                }`}
            />
            Dine In
          </button>
        </div>

        <label className="block text-sm font-medium text-gray-700 mb-1">Metode Pembayaran</label>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => setMethod('tunai')}
            className={`p-4 rounded-lg shadow text-center border transition hover:scale-105 flex flex-col items-center
              ${method === 'tunai' ? 'bg-amber-800 text-white border-amber-800' : 'bg-white text-amber-900 border-amber-300'}`}
          >
            <FaMoneyBillWave className="text-xl mb-1" />
            Bayar Tunai
          </button>
          <button
            disabled
            onClick={() => toast.info('💡 Metode QRIS belum tersedia.')}
            className="p-4 rounded-lg shadow text-center border bg-gray-100 text-gray-400 border-gray-300 flex flex-col items-center cursor-not-allowed"
          >
            <FaQrcode className="text-xl mb-1" />
            QRIS (Segera Hadir)
          </button>
        </div>

        <button
          onClick={handleCheckout}
          className="w-full bg-amber-900 hover:bg-amber-800 text-white py-3 rounded-lg font-bold transition"
        >
          Checkout Sekarang
        </button>
      </div>
    </div>
  );
};

export default Checkout;