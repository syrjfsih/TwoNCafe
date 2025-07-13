// File: src/utils/sessionHelper.jsx

// =====================
// CACHE MENU (localStorage)
// =====================

const MENU_CACHE_KEY = 'cachedMenu';
const MENU_CACHE_EXPIRY_KEY = 'cachedMenuExpiredAt';
const MENU_CACHE_TTL_MINUTES = 15; // TTL 5 menit

// Simpan data menu dan waktu expired-nya
export const setCachedMenu = (menuData) => {
  localStorage.setItem(MENU_CACHE_KEY, JSON.stringify(menuData));
  const expiry = Date.now() + MENU_CACHE_TTL_MINUTES * 60 * 1000;
  localStorage.setItem(MENU_CACHE_EXPIRY_KEY, expiry.toString());
};

// Ambil data menu dari cache
export const getCachedMenu = () => {
  const data = localStorage.getItem(MENU_CACHE_KEY);
  try {
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

// Cek apakah menu masih valid (belum kedaluwarsa)
export const isMenuCacheValid = () => {
  const expiry = localStorage.getItem(MENU_CACHE_EXPIRY_KEY);
  return expiry && parseInt(expiry) > Date.now();
};

// Hapus semua cache menu
export const clearMenuCache = () => {
  localStorage.removeItem(MENU_CACHE_KEY);
  localStorage.removeItem(MENU_CACHE_EXPIRY_KEY);
};

// ===============================
// CACHE STATUS BUKA & JAM (sessionStorage)
// ===============================

// Simpan status buka (true/false)
export const setCachedOpenStatus = (isOpen) => {
  sessionStorage.setItem('isOpen', JSON.stringify(isOpen));
};

// Ambil status buka dari cache
export const getCachedOpenStatus = () => {
  const status = sessionStorage.getItem('isOpen');
  return status ? JSON.parse(status) : null;
};

// Simpan jam operasional (string, ex: "08:00 - 22:00")
export const setCachedOperationalHours = (value) => {
  sessionStorage.setItem('jamOperasional', JSON.stringify(value));
};

// Ambil jam operasional dari cache
export const getCachedOperationalHours = () => {
  const data = sessionStorage.getItem('jamOperasional');
  return data ? JSON.parse(data) : null;
};

// ==========================
// STATUS PESANAN USER
// ==========================

// Cek apakah ada pesanan yang sedang aktif
export const isPesananAktif = () => {
  const status = localStorage.getItem('statusPesanan');
  return status && status.toLowerCase() !== 'selesai';
};

// Ambil nama pemesan dari localStorage
export const getNamaPemesan = () => {
  return localStorage.getItem('namaPemesan') || '';
};

// Ambil nomor meja dari localStorage
export const getNomorMeja = () => {
  return localStorage.getItem('nomorMeja') || '';
};

// Simpan status pesanan user (menunggu/diproses/selesai)
export const setStatusPesanan = (status) => {
  const meja = localStorage.getItem('nomorMeja');
  const nama = localStorage.getItem('namaPemesan');
  if (meja) localStorage.setItem('nomorMeja', meja);
  if (nama) localStorage.setItem('namaPemesan', nama);
  if (status) localStorage.setItem('statusPesanan', status);
};

// Hapus semua data sesi pemesanan
export const clearPesananSession = () => {
  const meja = getNomorMeja();
  localStorage.removeItem('statusPesanan');
  localStorage.removeItem('namaPemesan');
  localStorage.removeItem('nomorMeja');
  localStorage.removeItem(`userCart_meja_${meja}`);
};
