// Komponen ModalHapusMenu digunakan untuk menampilkan konfirmasi saat admin ingin menghapus menu.
// Props:
// - isOpen: boolean untuk menentukan apakah modal ditampilkan
// - onClose: fungsi untuk menutup modal
// - onConfirm: fungsi yang dijalankan saat admin mengonfirmasi penghapusan menu

const ModalHapusMenu = ({ isOpen, onClose, onConfirm }) => {
  // Jika modal tidak aktif (false), maka tidak akan ditampilkan (return null)
  if (!isOpen) return null;

  return (
    // Latar belakang gelap semi transparan untuk modal
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      
      {/* Kotak modal utama */}
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
        {/* Judul modal */}
        <h2 className="text-xl font-bold text-[#702F25] mb-4">Hapus Menu</h2>

        {/* Pesan konfirmasi */}
        <p className="text-gray-700 mb-6">
          Apakah kamu yakin ingin menghapus menu ini?
        </p>

        {/* Tombol aksi */}
        <div className="flex justify-end gap-3">
          {/* Tombol untuk membatalkan dan menutup modal */}
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            Tidak
          </button>

          {/* Tombol untuk mengonfirmasi penghapusan menu */}
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
          >
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalHapusMenu;
