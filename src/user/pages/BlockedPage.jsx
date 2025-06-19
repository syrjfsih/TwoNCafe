const BlockedPage = () => {
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-red-100 text-red-700">
      <h1 className="text-2xl font-bold mb-2">Akses Ditolak</h1>
      <p className="text-sm">Silakan scan QR code dari meja untuk mengakses halaman ini.</p>
    </div>
  );
};

export default BlockedPage;
