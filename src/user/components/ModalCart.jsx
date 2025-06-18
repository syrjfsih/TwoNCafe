import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ModalCart = ({ show, onClose, cart, onQuantityChange, onRemoveItem, onResetCart, onCheckout }) => {
  const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center"
        >
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-lg w-full max-w-md p-6 shadow-lg relative"
          >
            <button
              className="absolute top-3 right-4 text-gray-500 hover:text-gray-700"
              onClick={onClose}
            >
              ✕
            </button>
            <h2 className="text-2xl font-bold text-amber-900 mb-4">Isi Keranjang</h2>
            {cart.length === 0 ? (
              <p className="text-gray-600">Keranjang masih kosong.</p>
            ) : (
              <>
                <ul className="divide-y divide-gray-200 mb-4 max-h-64 overflow-y-auto">
                  {cart.map((item, index) => (
                    <li key={index} className="py-2 flex gap-4 items-center">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 rounded object-cover border"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{item.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <button
                            onClick={() => onQuantityChange(item.id, -1)}
                            className="bg-gray-200 px-2 rounded"
                          >-</button>
                          <span>{item.quantity}</span>
                          <button
                            onClick={() => onQuantityChange(item.id, 1)}
                            className="bg-gray-200 px-2 rounded"
                          >+</button>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-amber-800 font-semibold">
                          Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                        </p>
                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="text-sm text-red-600 hover:underline"
                        >
                          Hapus
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="text-right font-semibold text-lg text-amber-900 mb-4">
                  Total: Rp {totalPrice.toLocaleString('id-ID')}
                </div>

                <button
                  onClick={onCheckout}
                  className="w-full bg-amber-900 hover:bg-amber-800 text-white py-2 rounded-lg font-semibold transition"
                >
                  Checkout
                </button>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ModalCart;
