/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import MenuCard from '../components/MenuCard';
import NavbarUser from '../components/NavbarUser';
import ModalCart from '../components/ModalCart';
import ModalCheckout from '../components/ModalCheckout';
import { supabase } from '../../services/supabase';
import { toast } from 'react-toastify';
import { FaShoppingCart } from 'react-icons/fa';
import { motion } from 'framer-motion';
import 'react-toastify/dist/ReactToastify.css';
import { useLocation, useNavigate } from 'react-router-dom';

const Menu = () => {
  const [menuList, setMenuList] = useState([]);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [loading, setLoading] = useState(true);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const meja = params.get('meja');

    if (!meja) {
      toast.error("🚫 Akses menu hanya lewat QR meja.");
      navigate('/');
      return;
    }

    checkMejaStatus(meja);
  }, [location.search]);

  const checkMejaStatus = async (meja) => {
    const { data, error } = await supabase
      .from('orders')
      .select('id')
      .eq('table_number', parseInt(meja))
      .is('ended_at', null)
      .neq('status', 'selesai');

    if (error) {
      console.error("Error checking meja:", error);
      toast.error("Gagal memverifikasi meja.");
      navigate('/');
      return;
    }

    if (data.length > 0) {
      toast.error(`⚠️ Meja ${meja} masih digunakan. Silakan tunggu pesanan sebelumnya selesai.`);
      navigate('/');
      return;
    }

    localStorage.setItem('nomorMeja', meja);
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    const { data, error } = await supabase
      .from('menu')
      .select('*')
      .eq('is_deleted', false);

    if (error) {
      toast.error('Gagal mengambil data menu!');
      return;
    }

    setMenuList(data);
    setLoading(false);
  };

  const handleAddToCart = (item) => {
    if (item.stock === 0) {
      toast.warning("Stok habis, tidak bisa dipesan!");
      return;
    }

    const exists = cart.find((cartItem) => cartItem.id === item.id);
    if (exists) {
      if (exists.quantity + 1 > item.stock) {
        toast.warning("Jumlah melebihi stok tersedia!");
        return;
      }
      setCart(cart.map((cartItem) =>
        cartItem.id === item.id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }

    toast.success(`${item.name} ditambahkan ke keranjang!`, {
      position: 'top-right',
      autoClose: 2000,
    });
  };

  const handleCheckout = async (paymentMethod, name, table, orderType) => {
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Validasi stok sebelum checkout
    const isOutOfStock = cart.some(item => {
      const menu = menuList.find(menu => menu.id === item.id);
      return !menu || item.quantity > menu.stock;
    });

    if (isOutOfStock) {
      toast.error("❌ Ada item yang stok-nya tidak mencukupi!");
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
      .from("orders")
      .insert(payload)
      .select()
      .single();

    if (orderError) {
      toast.error("❌ Gagal menyimpan pesanan: " + orderError.message);
      return;
    }

    const itemsToInsert = cart.map((item) => ({
      order_id: orderData.id,
      menu_id: item.id,
      quantity: item.quantity,
      price: item.price,
    }));

    const { error: itemError } = await supabase.from('order_items').insert(itemsToInsert);

    if (itemError) {
      toast.error("❌ Gagal menyimpan item pesanan: " + itemError.message);
      return;
    }

    // Update stok di Supabase
    for (let item of cart) {
      const { error: stokError } = await supabase
        .from('menu')
        .update({ stock: item.stock - item.quantity })
        .eq('id', item.id);

      if (stokError) {
        console.error(`❌ Gagal update stok ${item.name}:`, stokError);
      }
    }

    toast.success("✅ Pesanan berhasil disimpan!");
    setCart([]);
    setShowCart(false);
    setShowCheckout(false);

    navigate(`/status?nama=${encodeURIComponent(name)}&meja=${table}`);
  };

  const makanan = menuList.filter(item => item.kategori === 'makanan');
  const minuman = menuList.filter(item => item.kategori === 'minuman');

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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6 animate-pulse">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="bg-white h-56 rounded-xl shadow border border-gray-200"></div>
            ))}
          </div>
        ) : (
          <>
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-amber-900 mb-4">Makanan</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                {makanan.map((item) => (
                  <motion.div key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
                    <MenuCard
                      id={item.id}
                      image={item.image}
                      name={item.name}
                      description={item.description}
                      price={item.price}
                      stock={item.stock}
                      onAddToCart={() =>
                        handleAddToCart({
                          id: item.id,
                          name: item.name,
                          price: item.price,
                          image: item.image,
                          description: item.description,
                          stock: item.stock
                        })
                      }
                    />
                  </motion.div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-amber-900 mb-4">Minuman</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                {minuman.map((item) => (
                  <motion.div key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
                    <MenuCard
                      id={item.id}
                      image={item.image}
                      name={item.name}
                      description={item.description}
                      price={item.price}
                      stock={item.stock}
                      onAddToCart={() =>
                        handleAddToCart({
                          id: item.id,
                          name: item.name,
                          price: item.price,
                          image: item.image,
                          description: item.description,
                          stock: item.stock
                        })
                      }
                    />
                  </motion.div>
                ))}
              </div>
            </section>
          </>
        )}

        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
          <button
            onClick={() => setShowCart(true)}
            className="bg-amber-900 text-white p-3 sm:p-4 rounded-full shadow-lg hover:bg-amber-800 transition relative"
          >
            <FaShoppingCart size={20} className="sm:size-6" />
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] sm:text-xs font-bold rounded-full px-1.5">
                {cart.reduce((acc, item) => acc + item.quantity, 0)}
              </span>
            )}
          </button>
        </div>

        <ModalCart
          show={showCart}
          onClose={() => setShowCart(false)}
          cart={cart}
          onResetCart={() => setCart([])}
          onQuantityChange={(id, delta) => {
            setCart((prevCart) =>
              prevCart
                .map((item) =>
                  item.id === id ? { ...item, quantity: item.quantity + delta } : item
                )
                .filter((item) => item.quantity > 0)
            );
          }}
          onRemoveItem={(id) =>
            setCart((prevCart) => prevCart.filter((item) => item.id !== id))
          }
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
