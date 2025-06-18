import { useState } from 'react';
import { supabase } from '../../services/supabase';
import { FaPrint } from 'react-icons/fa';

const ModalUbahStatus = ({ isOpen, onClose, onSave, currentStatus, orderId, fetchOrders }) => {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);

  const handlePrint = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select(
        `name, table_number, total, status, order_items (
          quantity, price,
          menu:menu_id (name)
        )`
      )
      .eq('id', orderId)
      .single();

    if (error || !data) return;

    const win = window.open('', 'PRINT', 'height=650,width=800');
    win.document.write(`<html><head><title>Struk Pesanan</title></head><body>`);
    win.document.write(`<h2>TwoNCafe</h2>`);
    win.document.write(`<p><strong>Nama:</strong> ${data.name}</p>`);
    win.document.write(`<p><strong>Meja:</strong> ${data.table_number}</p>`);
    win.document.write(`<p><strong>Status:</strong> ${data.status}</p>`);
    win.document.write(`<hr />`);
    data.order_items.forEach((item) => {
      win.document.write(
        `<p>${item.menu?.name || 'Menu'} x ${item.quantity} = Rp ${(
          item.price * item.quantity
        ).toLocaleString('id-ID')}</p>`
      );
    });
    win.document.write(`<hr />`);
    win.document.write(`<strong>Total: Rp ${data.total.toLocaleString('id-ID')}</strong>`);
    win.document.write(`</body></html>`);
    win.document.close();
    win.focus();
    win.print();
    win.close();
  };

  const handleSubmit = async () => {
    setLoading(true);
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId);

    setLoading(false);

    if (error) {
      alert('Gagal mengubah status!');
      console.error(error);
      return;
    }

    if (fetchOrders) fetchOrders(); // Refresh data
    if (onSave) onSave(status);     // Opsional, tergantung parent
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-center">
      <div className="bg-white p-6 rounded-xl w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-[#702F25]">Ubah Status Pesanan</h2>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4"
        >
          <option value="Menunggu">Menunggu</option>
          <option value="Diproses">Diproses</option>
          <option value="Selesai">Selesai</option>
        </select>

        <div className="flex justify-between mt-4">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 text-sm text-white bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg"
          >
            <FaPrint /> Cetak Struk
          </button>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm bg-gray-300 hover:bg-gray-400 rounded-md"
            >
              Batal
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-4 py-2 text-sm bg-[#702F25] hover:bg-[#5a241d] text-white rounded-md"
            >
              {loading ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalUbahStatus;
