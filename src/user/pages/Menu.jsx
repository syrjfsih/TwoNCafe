/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaShoppingCart } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { isPesananAktif, getNomorMeja, getNamaPemesan } from "../../utils/sessionHelper";
import MenuCard from '../components/MenuCard';
import NavbarUser from '../components/NavbarUser';
import ModalCart from '../components/ModalCart';
import ModalCheckout from '../components/ModalCheckout';

import { supabase } from '../../services/supabase';
import 'react-toastify/dist/ReactToastify.css';

// ======== CACHE UTILS ========

const MENU_CACHE_KEY = 'cachedMenu';
const MENU_CACHE_EXPIRED_KEY = 'cachedMenuExpiredAt';
const MENU_TTL_MIN = 15;

const getCachedMenu = () => {
  const data = localStorage.getItem(MENU_CACHE_KEY);
  try {
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

const setCachedMenu = (data) => {
  localStorage.setItem(MENU_CACHE_KEY, JSON.stringify(data));
  localStorage.setItem(MENU_CACHE_EXPIRED_KEY, Date.now() + MENU_TTL_MIN * 60 * 1000);
};

const isMenuCacheValid = () => {
  const expiredAt = localStorage.getItem(MENU_CACHE_EXPIRED_KEY);
  return expiredAt && parseInt(expiredAt) > Date.now();
};

const Menu = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [menuList, setMenuList] = useState([]);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [loading, setLoading] = useState(true);
  const [nomorMeja, setNomorMeja] = useState(null);
  const [namaPemesan, setNamaPemesan] = useState(null);

  const getCartKey = (meja) => `userCart_meja_${meja}`;
  const getCartFromStorage = (meja) => {
    try {
      const data = localStorage.getItem(getCartKey(meja));
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  };
  const setCartToStorage = (meja, data) => {
    localStorage.setItem(getCartKey(meja), JSON.stringify(data));
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    let meja = params.get('meja');
    let nama = params.get('nama');

    if (!meja && isPesananAktif()) {
      meja = getNomorMeja();
      nama = getNamaPemesan();
      if (meja && nama) {
        navigate(`/menu?meja=${meja}&nama=${encodeURIComponent(nama)}`, { replace: true });
        return;
      }
    }

    const sudahRefresh = sessionStorage.getItem('refreshMenuOnce');

    if (meja && !sudahRefresh) {
      sessionStorage.setItem('refreshMenuOnce', 'true');
      window.location.href = `/menu?meja=${meja}&nama=${nama || ''}`;
      return;
    }

    if (!meja) {
      toast.error("🚫 Akses menu hanya lewat QR meja.");
      navigate('/');
      return;
    }

    setNomorMeja(meja);
    setNamaPemesan(nama);
    localStorage.setItem('nomorMeja', meja);
    if (nama) localStorage.setItem('namaPemesan', nama);

    checkMejaStatus(meja);
  }, [location.search]);

  useEffect(() => {
    if (nomorMeja) {
      setCart(getCartFromStorage(nomorMeja));
    }
  }, [nomorMeja]);

  const checkMejaStatus = async (meja) => {
    const { data, error } = await supabase
      .from('orders')
      .select('id')
      .eq('table_number', parseInt(meja))
      .is('ended_at', null)
      .neq('status', 'selesai');

    if (error || (data && data.length > 0)) {
      // tetap diizinkan untuk menambah pesanan, jadi jangan navigasi ke /
      console.log(`Meja ${meja} sedang memiliki pesanan aktif, user tetap bisa menambah.`);
    }
  };

  useEffect(() => {
    const cached = getCachedMenu();
    if (cached && isMenuCacheValid()) {
      setMenuList(cached);
      setLoading(false);
    }

    fetchMenu();

    const subscription = supabase
      .channel('menu-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'menu' }, () => {
        fetchMenu();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const fetchMenu = async () => {
    const { data, error } = await supabase
      .from('menu')
      .select('*')
      .eq('is_deleted', false);

    if (error) {
      toast.error('Gagal mengambil menu!');
      return;
    }

    setMenuList(data);
    setCachedMenu(data);
    setLoading(false);
  };

  const handleAddToCart = (item) => {
    if (!nomorMeja) return;
    if (item.stock === 0) {
      toast.warning("Stok habis!");
      return;
    }

    const exists = cart.find((i) => i.id === item.id);
    let updatedCart;
    if (exists) {
      if (exists.quantity + 1 > item.stock) {
        toast.warning("Melebihi stok tersedia!");
        return;
      }
      updatedCart = cart.map((i) =>
        i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
      );
    } else {
      updatedCart = [...cart, { ...item, quantity: 1 }];
    }

    setCart(updatedCart);
    setCartToStorage(nomorMeja, updatedCart);
    toast.success(`${item.name} ditambahkan!`);
  };

  const handleCheckout = async (paymentMethod, name, table, orderType) => {
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const isOutOfStock = cart.some(item => {
      const menu = menuList.find(m => m.id === item.id);
      return !menu || item.quantity > menu.stock;
    });

    if (isOutOfStock) {
      toast.error("❌ Stok tidak mencukupi!");
      return;
    }

    const orderItemsJSON = cart.map(item => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price
    }));

    const payload = {
      name,
      table_number: parseInt(table),
      order_type: orderType,
      payment_method: paymentMethod,
      total,
      status: 'menunggu',
      ended_at: null,
      order_items: orderItemsJSON,
    };

    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert(payload)
      .select()
      .single();

    if (orderError) {
      toast.error("❌ Gagal menyimpan pesanan!");
      return;
    }

    const itemsToInsert = cart.map(item => ({
      order_id: orderData.id,
      menu_id: item.id,
      quantity: item.quantity,
      price: item.price,
    }));

    await supabase.from('order_items').insert(itemsToInsert);

    for (let item of cart) {
      await supabase
        .from('menu')
        .update({ stock: item.stock - item.quantity })
        .eq('id', item.id);
    }

    toast.success("✅ Pesanan berhasil!");
    setCart([]);
    setCartToStorage(nomorMeja, []);

    // Simpan status dan nama ke localStorage
    localStorage.setItem('statusPesanan', 'menunggu');
    localStorage.setItem('namaPemesan', name);
    localStorage.setItem('nomorMeja', table);

    setShowCart(false);
    setShowCheckout(false);
    navigate(`/status?nama=${encodeURIComponent(name)}&meja=${table}`);
  };

  const makanan = menuList.filter(m => m.kategori === 'makanan');
  const minuman = menuList.filter(m => m.kategori === 'minuman');

  useEffect(() => {
    let timeoutId;
    const meja = localStorage.getItem('nomorMeja');
    const nama = localStorage.getItem('namaPemesan');

    const resetIfIdle = async () => {
      if (!meja || !nama) return;

      const { data, error } = await supabase
        .from('orders')
        .select('id')
        .eq('table_number', parseInt(meja))
        .ilike('name', nama)
        .is('ended_at', null)
        .neq('status', 'selesai');

      const hasActiveOrder = data && data.length > 0;

      if (!hasActiveOrder) {
        localStorage.removeItem('nomorMeja');
        localStorage.removeItem('namaPemesan');
        localStorage.removeItem(`userCart_meja_${meja}`);
        localStorage.removeItem('statusPesanan');
        window.location.href = '/';
      }
    };

    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(resetIfIdle, 2 * 60 * 1000); // 2 menit
    };

    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('click', resetTimer);
    window.addEventListener('keydown', resetTimer);
    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('click', resetTimer);
      window.removeEventListener('keydown', resetTimer);
    };
  }, []);

  return (
    <>
      <NavbarUser />
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative min-h-screen bg-orange-50 py-6 px-4 sm:px-6 lg:px-8"
      >
        <h1 className="text-3xl font-bold text-orange-700 mb-6 text-center">Daftar Menu</h1>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 animate-pulse">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="bg-white h-56 rounded-xl shadow border" />
            ))}
          </div>
        ) : (
          <>
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-amber-900 mb-4">Makanan</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {makanan.map(item => (
                  <MenuCard key={item.id} {...item} onAddToCart={() => handleAddToCart(item)} />
                ))}
              </div>
            </section>
            <section>
              <h2 className="text-2xl font-semibold text-amber-900 mb-4">Minuman</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {minuman.map(item => (
                  <MenuCard key={item.id} {...item} onAddToCart={() => handleAddToCart(item)} />
                ))}
              </div>
            </section>
          </>
        )}

        <div className="fixed bottom-4 right-4 z-50">
          <button
            onClick={() => setShowCart(true)}
            className="bg-amber-900 text-white p-3 rounded-full shadow hover:bg-amber-800 relative"
          >
            <FaShoppingCart size={20} />
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full px-1.5">
                {cart.reduce((acc, item) => acc + item.quantity, 0)}
              </span>
            )}
          </button>
        </div>

        <ModalCart
          show={showCart}
          onClose={() => setShowCart(false)}
          cart={cart}
          onResetCart={() => {
            setCart([]);
            setCartToStorage(nomorMeja, []);
          }}
          onQuantityChange={(id, delta) => {
            const updatedCart = cart
              .map(item => item.id === id ? { ...item, quantity: item.quantity + delta } : item)
              .filter(item => item.quantity > 0);
            setCart(updatedCart);
            setCartToStorage(nomorMeja, updatedCart);
          }}
          onRemoveItem={(id) => {
            const updatedCart = cart.filter(item => item.id !== id);
            setCart(updatedCart);
            setCartToStorage(nomorMeja, updatedCart);
          }}
          onCheckout={() => {
            setShowCart(false);
            setShowCheckout(true);
          }}
        />

        <ModalCheckout
          show={showCheckout}
          onClose={() => setShowCheckout(false)}
          onConfirm={({ name, table, orderType, paymentMethod }) => {
            handleCheckout(paymentMethod, name, table, orderType);
          }}
          cart={cart}
        />
      </motion.main>
    </>
  );
};

export default Menu;
