// Komponen modal konfirmasi hapus pesanan
// Props:
// - isOpen: boolean, apakah modal ditampilkan
// - onClose: fungsi untuk menutup modal
// - onConfirm: fungsi untuk menghapus data saat tombol "Hapus" diklik

const ModalHapusPesanan = ({ isOpen, onClose, onConfirm }) => {
  // Jika modal tidak aktif, return null (tidak dirender sama sekali)
  if (!isOpen) return null;

  return (
    // Background gelap semi-transparan di belakang modal
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      {/* Kontainer utama modal */}
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
        {/* Judul modal */}
        <h2 className="text-xl font-semibold text-[#702F25] mb-4">Konfirmasi Hapus</h2>
        
        {/* Pesan konfirmasi */}
        <p className="text-gray-700 mb-6">
          Yakin ingin menghapus pesanan ini?
        </p>

        {/* Tombol aksi */}
        <div className="flex justify-end gap-3">
          {/* Tombol batal - hanya menutup modal */}
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
          >
            Batal
          </button>

          {/* Tombol hapus - memicu fungsi onConfirm dari parent */}
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalHapusPesanan;
