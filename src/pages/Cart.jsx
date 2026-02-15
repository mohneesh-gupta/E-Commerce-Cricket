import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import toast from "react-hot-toast";
import {
  TrashIcon,
  TicketIcon,
  ArrowRightIcon,
  ShoppingBagIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import { getDirectImageUrl } from "../utils/imageUtils";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase/config";

const Cart = () => {
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    clearCart,
    cartCount,
    loading,
  } = useCart();

  const navigate = useNavigate();

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  // Modal state for delete confirmation
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [showClearCartModal, setShowClearCartModal] = useState(false);

  /* -------------------- LOADING -------------------- */
  if (loading) {
    return (
      <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center bg-gray-50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 bg-gray-300 rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  /* -------------------- EMPTY CART -------------------- */
  if (!loading && cartItems.length === 0) {
    return <EmptyCart />;
  }

  /* -------------------- CALCULATIONS -------------------- */
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Free shipping over 5000 (Example logic)
  const shipping = subtotal > 5000 ? 0 : 150;
  const couponDiscount = appliedCoupon
    ? (subtotal * appliedCoupon.discount) / 100
    : 0;

  // The client requested NOT to show "Order Summary me final money" in cart.
  // We keep the calculation for logic but will hide it in UI.
  const finalTotal = subtotal + shipping - couponDiscount;

  /* -------------------- HANDLERS -------------------- */
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    try {
      const q = query(
        collection(db, "coupons"),
        where("code", "==", couponCode.toUpperCase()),
        where("isActive", "==", true)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const couponData = querySnapshot.docs[0].data();
        setAppliedCoupon({
          ...couponData,
          id: querySnapshot.docs[0].id
        });
        toast.success("Coupon Applied Successfully!");
      } else {
        // Fallback to hardcoded for demo if needed, or just error
        // Keeping legacy hardcoded for compatibility if DB empty:
        const demoCoupons = {
          RINKU35: { discount: 10, name: "10% Off (God's Plan)" },
          WELCOME20: { discount: 20, name: "20% Welcome Discount" },
          CRICKET10: { discount: 10, name: "10% Cricket Gear" },
        };

        if (demoCoupons[couponCode.toUpperCase()]) {
          setAppliedCoupon(demoCoupons[couponCode.toUpperCase()]);
          toast.success("Coupon Applied Successfully!");
        } else {
          toast.error("Invalid coupon code");
          setAppliedCoupon(null);
        }
      }
    } catch (error) {
      console.error("Error applying coupon:", error);
      toast.error("Failed to apply coupon");
    }
  };

  const handleCheckout = () => {
    navigate("/checkout");
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-gray-50 pb-20">
      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <DeleteConfirmationModal
            itemName={itemToDelete?.name}
            onConfirm={() => {
              removeFromCart(itemToDelete.id);
              setShowDeleteModal(false);
              setItemToDelete(null);
            }}
            onCancel={() => {
              setShowDeleteModal(false);
              setItemToDelete(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* Clear Cart Confirmation Modal */}
      <AnimatePresence>
        {showClearCartModal && (
          <DeleteConfirmationModal
            itemName="all items"
            onConfirm={() => {
              clearCart();
              setShowClearCartModal(false);
            }}
            onCancel={() => setShowClearCartModal(false)}
          />
        )}
      </AnimatePresence>

      {/* Header / Nav */}
      <div className="bg-white border-b shadow-sm/50 backdrop-blur-md bg-white/80">
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-2 transition-colors group-hover:bg-gray-100 rounded-full">
              <ArrowLeftIcon className="h-5 w-5 text-gray-700" />
            </div>
            <span className="font-bold text-lg text-blue-900 group-hover:text-blue-600 transition-colors">Continue Shopping</span>
          </Link>
          <div className="font-medium text-gray-600">
            {cartCount} Items in Bag
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* LEFT COLUMN: Cart Items */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex justify-between items-end mb-4">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Your Cart</h1>
            <button
              onClick={() => setShowClearCartModal(true)}
              className="text-sm font-medium text-red-500 hover:text-red-700 hover:underline transition-colors"
            >
              Clear Cart
            </button>
          </div>

          <div className="space-y-4">
            <AnimatePresence>
              {cartItems.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  updateQuantity={updateQuantity}
                  onDeleteClick={(item) => {
                    setItemToDelete(item);
                    setShowDeleteModal(true);
                  }}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* RIGHT COLUMN: Summary */}
        <div className="lg:col-span-4 relative">
          <div className="sticky top-24 space-y-6">

            {/* Order Summary */}
            <div className="bg-white p-8 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">Order Summary</h2>

              <div className="space-y-4 text-gray-600 mb-8">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium text-gray-900">₹{subtotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full group relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-2xl font-bold hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-blue-200/50 transition-all"
              >
                <div className="flex items-center justify-center gap-2 relative z-10">
                  <span>Checkout</span>
                  <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              </button>

              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400 font-medium">
                <LockIcon className="w-3 h-3" />
                Payments are secure and encrypted
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

/* -------------------- SUB COMPONENTS (confirm delete)-------------------- */

const DeleteConfirmationModal = ({ itemName, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    {/* Backdrop */}
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onCancel}
      className="absolute inset-0 bg-black/60 backdrop-blur-sm"
    />

    {/* Modal */}
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      transition={{ type: "spring", duration: 0.5 }}
      className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
    >
      {/* Decorative gradient bar */}
      <div className="h-2 bg-gradient-to-r from-red-500 via-orange-500 to-red-500" />

      <div className="p-8">
        {/* Icon */}
        <div className="w-16 h-16 mx-auto mb-6 bg-red-50 rounded-full flex items-center justify-center">
          <TrashIcon className="w-8 h-8 text-red-500" />
        </div>

        {/* Content */}
        <div className="text-center mb-8">
          <h3 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">
            Remove Item?
          </h3>
          <p className="text-gray-600 font-medium leading-relaxed">
            Are you sure you want to remove{" "}
            <span className="font-black text-gray-900">{itemName}</span> from your cart?
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-6 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-black uppercase tracking-wider text-xs transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-6 py-3.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl font-black uppercase tracking-wider text-xs transition-all shadow-lg shadow-red-200 hover:shadow-xl hover:shadow-red-300"
          >
            Remove
          </button>
        </div>
      </div>
    </motion.div>
  </div>
);

/* -------------------- SUB COMPONENTS -------------------- */

const EmptyCart = () => (
  <div className="min-h-[calc(100vh-5rem)] flex flex-col items-center justify-center bg-white">
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="bg-gray-50 p-8 rounded-full mb-6"
    >
      <ShoppingBagIcon className="h-16 w-16 text-gray-300" />
    </motion.div>
    <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Your Bag is Empty</h2>
    <p className="text-gray-500 mb-8 max-w-sm text-center leading-relaxed">
      Looks like you haven't added any cricket gear yet. Go find your perfect bat!
    </p>
    <Link
      to="/products"
      className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-full font-bold shadow-xl shadow-blue-200 hover:scale-105 active:scale-95 transition-all"
    >
      Start Shopping
    </Link>
  </div>
);

const CartItem = ({ item, updateQuantity, onDeleteClick }) => {
  const handleRemove = () => {
    onDeleteClick(item);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="bg-white p-3 sm:p-6 rounded-3xl shadow-[0_2px_20px_rgb(0,0,0,0.04)] border border-gray-100 flex gap-3 sm:gap-6 group hover:border-gray-200 transition-colors"
    >
      <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-100">
        <Link to={`/product/${item.productId || item.id}`}>
          <img
            src={getDirectImageUrl(item.image)}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
          />
        </Link>
      </div>

      <div className="flex-1 flex flex-col justify-between py-1">
        <div>
          <div className="flex justify-between items-start">
            <Link to={`/product/${item.productId || item.id}`} className="flex-1 pr-4">
              <h3 className="font-bold text-gray-900 text-lg leading-tight line-clamp-2 hover:text-blue-600 transition-colors cursor-pointer">
                {item.name}
              </h3>
            </Link>
            <button
              onClick={handleRemove}
              className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-xl transition-all"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          </div>
          <p className="text-sm text-gray-500 font-medium mt-1">Grade A Willow</p>
        </div>

        <div className="flex items-end justify-between mt-4">
          {/* Quantity Control */}
          <div className="flex items-center bg-gray-50 rounded-xl border border-gray-200">
            <button
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
              disabled={item.quantity <= 1}
              className="px-3 py-2 text-gray-600 hover:text-black disabled:opacity-30 font-bold transition-colors"
            >
              −
            </button>
            <div className="w-8 text-center font-bold text-gray-900 text-sm">
              {item.quantity}
            </div>
            <button
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
              className="px-3 py-2 text-gray-600 hover:text-black font-bold transition-colors"
            >
              +
            </button>
          </div>

          <div className="text-right">
            <div className="text-sm text-gray-400 font-medium">{item.quantity} x ₹{item.price}</div>
            <div className="text-xl font-bold text-gray-900">₹{(item.price * item.quantity).toLocaleString()}</div>
          </div>
        </div>
      </div>
    </motion.div >
  );
};

const LockIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
  </svg>
);

export default Cart;
