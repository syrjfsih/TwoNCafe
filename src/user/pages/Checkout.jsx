import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaMoneyBillWave } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { supabase } from '../../services/supabase';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { cart = [] } = location.state || {};
  const [name, setName] = useState('');
  const [orderType, setOrderType] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('tunai'); // default tunai
  const [lockedTable, setLockedTable] = useState('');
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  useEffect(() => {
    const meja = new URLSearchParams(location.search).get('meja') || localStorage.getItem('nomorMeja');
    if (!meja) {
      toast.error('❌ Akses tidak valid. Silakan scan QR kembali.');
      navigate('/');
      return;
    }
    localStorage.setItem('nomorMeja', meja);
    setLockedTable(meja);
  }, []);

  const handleCheckout = async () => {
    if (!name.trim() || !orderType || !lockedTable) {
      toast.error('❌ Lengkapi semua data terlebih dahulu.');
      return;
    }

    const parsedTable = parseInt(lockedTable);
    if (isNaN(parsedTable)) {
      toast.error('❌ Nomor meja tidak valid.');
      return;
    }

    // Simpan ke orders
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        name,
        table_number: parsedTable,
        order_type: orderType,
        payment_method: paymentMethod,
        total,
        created_at: new Date().toISOString(),
        status: 'menunggu',
        ended_at: null
      })
      .select()
      .single();

    if (orderError) {
      toast.error('❌ Gagal menyimpan pesanan.');
      return;
    }

    // Simpan detail item
    const itemsToInsert = cart.map((item) => ({
      order_id: orderData.id,
      menu_id: item.id,
      quantity: item.quantity,
      price: item.price,
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(itemsToInsert);
    if (itemsError) {
      toast.error('❌ Gagal menyimpan detail pesanan.');
      return;
    }

    // Kurangi stok menu
    for (let item of cart) {
      await supabase
        .from('menu')
        .update({ stock: item.stock - item.quantity })
        .eq('id', item.id);
    }

    // Sukses
    localStorage.removeItem('nomorMeja');
    toast.success('✅ Pesanan berhasil dikonfirmasi!');
    navigate(`/status?nama=${encodeURIComponent(name)}&meja=${parsedTable}`, {
      state: { cart, total, orderType }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-amber-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto bg-white rounded-xl shadow-2xl p-8 border border-amber-200">
        <h2 className="text-xl font-bold text-amber-900 mb-6 text-center">Checkout Pesanan</h2>

        {/* Input Nama */}
        <label className="block text-sm font-medium text-gray-700">Nama Pemesan</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Masukkan nama lengkap"
          className="w-full border px-3 py-2 rounded-lg text-sm mb-4 bg-gray-50"
        />

        {/* Nomor Meja (Terkunci) */}
        <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Meja</label>
        <input
          type="text"
          value={lockedTable}
          disabled
          className="w-full border px-3 py-2 rounded-lg text-sm mb-4 bg-gray-100 text-gray-700 font-semibold"
        />

        {/* Tipe Pemesanan */}
        <label className="block text-sm font-medium text-gray-700 mb-1">Tipe Pemesanan</label>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <button
            onClick={() => setOrderType('takeaway')}
            className={`p-4 rounded-lg shadow text-center border transition hover:scale-105 flex flex-col items-center
              ${orderType === 'takeaway' ? 'bg-amber-800 text-white border-amber-800' : 'bg-white text-amber-900 border-amber-300'}`}
          >
            <img
              src="/foto-icon/take-away.png"
              alt="Take Away"
              className={`w-8 h-8 mx-auto mb-1 transition ${orderType === 'takeaway' ? 'brightness-0 invert' : ''}`}
            />
            Take Away
          </button>
          <button
            onClick={() => setOrderType('dinein')}
            className={`p-4 rounded-lg shadow text-center border transition hover:scale-105 flex flex-col items-center
              ${orderType === 'dinein' ? 'bg-amber-800 text-white border-amber-800' : 'bg-white text-amber-900 border-amber-300'}`}
          >
            <img
              src="/foto-icon/dine-in.png"
              alt="Dine In"
              className={`w-8 h-8 mx-auto mb-1 transition ${orderType === 'dinein' ? 'brightness-0 invert' : ''}`}
            />
            Dine In
          </button>
        </div>

        {/* Metode Pembayaran - Hanya Tunai */}
        <label className="block text-sm font-medium text-gray-700 mb-1">Metode Pembayaran</label>
        <div className="grid grid-cols-1 gap-4 mb-6">
          <button
            onClick={() => setPaymentMethod('tunai')}
            className={`p-4 rounded-lg shadow text-center border transition hover:scale-105 flex flex-col items-center
              ${paymentMethod === 'tunai' ? 'bg-amber-800 text-white border-amber-800' : 'bg-white text-amber-900 border-amber-300'}`}
          >
            <FaMoneyBillWave className="text-xl mb-1" />
            Bayar Tunai
          </button>
        </div>

        {/* Tombol Checkout */}
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
