import React, { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase/config";
import {
  addDoc,
  collection,
  serverTimestamp,
  doc,
  getDoc,
  runTransaction,
  increment,
} from "firebase/firestore";
import { useNavigate, useLocation } from "react-router-dom";
import { getDirectImageUrl } from "../utils/imageUtils";
import toast from "react-hot-toast";

const Checkout = () => {
  const { cartItems, clearCart, cartTotal } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const buyNowItem = location.state?.buyNowItem;
  const itemsToPurchase = buyNowItem ? [buyNowItem] : cartItems;
  const activeSubtotal = buyNowItem ? buyNowItem.price * buyNowItem.quantity : cartTotal;

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [address, setAddress] = useState({
    fullName: "",
    phone: "",
    pincode: "",
    addressLine: "",
    city: "",
    state: "",
  });

  const [shippingMethod, setShippingMethod] = useState("standard"); // standard | express
  const [paymentMethod, setPaymentMethod] = useState("upi"); // cod | upi | card

  const shippingCost = shippingMethod === "express" ? 150 : 0;
  const finalTotal = activeSubtotal + shippingCost;

  useEffect(() => {
    if (itemsToPurchase.length === 0) {
      navigate("/products");
    }
  }, [itemsToPurchase, navigate]);

  // Pre-fill address from profile
  useEffect(() => {
    if (!currentUser) return;
    const fetchUser = async () => {
      const snap = await getDoc(doc(db, "users", currentUser.uid));
      if (snap.exists()) {
        const data = snap.data();
        if (data.address) {
          setAddress({
            fullName: data.address.fullName || "",
            phone: data.address.phone || "",
            pincode: data.address.pincode || "",
            addressLine: data.address.addressLine || "",
            city: data.address.city || "",
            state: data.address.state || "",
          });
        }
      }
    };
    fetchUser();
  }, [currentUser]);

  const handlePlaceOrder = async () => {
    if (!currentUser) return;

    // 0. Validation
    const requiredFields = ['fullName', 'phone', 'pincode', 'city', 'addressLine'];
    const missingFields = requiredFields.filter(field => !address[field]?.trim());

    if (missingFields.length > 0) {
      toast.error("Please fill in all shipping details");
      return;
    }

    setLoading(true);

    try {
      // Use Transaction for Stock Update and Order Creation
      const orderRef = await runTransaction(db, async (transaction) => {
        let validatedItems = [];

        // 1. Check and Update Stock for each item
        for (const item of itemsToPurchase) {
          const productId = item.id || item.productId;
          const productRef = doc(db, "products", productId);
          const productSnap = await transaction.get(productRef);

          if (!productSnap.exists()) {
            throw new Error(`Product ${item.name} does not exist!`);
          }

          const productData = productSnap.data();
          const currentStock = productData.stock || 0;

          if (currentStock < item.quantity) {
            throw new Error(`Insufficient stock for ${item.name}. Available: ${currentStock}`);
          }

          // Queue Stock Decrement
          transaction.update(productRef, {
            stock: increment(-item.quantity)
          });

          validatedItems.push({
            productId: productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image || item.images?.[0] || ""
          });
        }

        // 2. Prepare Order Data
        const orderData = {
          userId: currentUser.uid,
          items: validatedItems,
          shippingAddress: address,
          paymentMethod,
          shippingMethod,
          subtotal: activeSubtotal,
          shippingCost,
          totalAmount: finalTotal,
          status: "pending",
          createdAt: serverTimestamp(),
        };

        // 3. Create Order Document
        const newOrderRef = doc(collection(db, "orders"));
        transaction.set(newOrderRef, orderData);

        // 4. Add to User's Order History
        const userOrderRef = doc(collection(db, "users", currentUser.uid, "orders"));
        transaction.set(userOrderRef, {
          ...orderData,
          orderId: newOrderRef.id,
        });

        return newOrderRef;
      });

      // 4. Clear Cart ONLY if it wasn't a buyNow purchase
      if (!buyNowItem) {
        await clearCart();
      }

      // 5. Success
      // Mock Payment Delay (could be before or after order creation depending on flow, 
      // but here we keep it simple)
      await new Promise(resolve => setTimeout(resolve, 800));

      toast.success("Order Placed Successfully!");
      navigate(`/order-success/${orderRef.id}`);
    } catch (error) {
      console.error("Order failed:", error);
      toast.error(error.message || "Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* LEFT COLUMN - FORMS */}
        <div className="lg:col-span-8 space-y-6">

          {/* STEP 1: ADDRESS */}
          <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="bg-black text-white w-8 h-8 flex items-center justify-center rounded-full text-sm">1</span>
              Shipping Address
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                placeholder="Full Name"
                className="input-field border border-gray-300 p-3 rounded-lg"
                value={address.fullName}
                onChange={e => setAddress({ ...address, fullName: e.target.value })}
              />
              <input
                placeholder="Phone Number"
                className="input-field border border-gray-300 p-3 rounded-lg"
                value={address.phone}
                onChange={e => setAddress({ ...address, phone: e.target.value })}
              />
              <input
                placeholder="Pincode"
                className="input-field border border-gray-300 p-3 rounded-lg"
                value={address.pincode}
                onChange={e => setAddress({ ...address, pincode: e.target.value })}
              />
              <input
                placeholder="City"
                className="input-field border border-gray-300 p-3 rounded-lg"
                value={address.city}
                onChange={e => setAddress({ ...address, city: e.target.value })}
              />
              <div className="md:col-span-2">
                <textarea
                  placeholder="Address (House No, Building, Street, Area)"
                  className="w-full border border-gray-300 p-3 rounded-lg"
                  rows="3"
                  value={address.addressLine}
                  onChange={e => setAddress({ ...address, addressLine: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* STEP 2: SHIPPING METHOD */}
          <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="bg-black text-white w-8 h-8 flex items-center justify-center rounded-full text-sm">2</span>
              Shipping Method
            </h2>
            <div className="space-y-3">
              <label className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition ${shippingMethod === 'standard' ? 'border-blue-600 bg-blue-50' : 'border-gray-200'}`}>
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="shipping"
                    checked={shippingMethod === 'standard'}
                    onChange={() => setShippingMethod('standard')}
                  />
                  <div>
                    <p className="font-bold text-gray-900">Standard Delivery</p>
                    <p className="text-sm text-gray-500">Get it in 5-7 days</p>
                  </div>
                </div>
                <span className="font-bold text-green-600">FREE</span>
              </label>

              <label className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition ${shippingMethod === 'express' ? 'border-blue-600 bg-blue-50' : 'border-gray-200'}`}>
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="shipping"
                    checked={shippingMethod === 'express'}
                    onChange={() => setShippingMethod('express')}
                  />
                  <div>
                    <p className="font-bold text-gray-900">Express Delivery</p>
                    <p className="text-sm text-gray-500">Get it in 2-3 days</p>
                  </div>
                </div>
                <span className="font-bold text-gray-900">₹150</span>
              </label>
            </div>
          </div>

          {/* STEP 3: PAYMENT */}
          <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="bg-black text-white w-8 h-8 flex items-center justify-center rounded-full text-sm">3</span>
              Payment Method
            </h2>
            <div className="grid grid-cols-1 gap-3">
              {['upi'].map(method => (
                <label key={method} className={`flex flex-col items-center justify-center p-4 border rounded-xl cursor-pointer hover:bg-gray-50 transition ${paymentMethod === method ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600' : 'border-gray-200'}`}>
                  <input
                    type="radio"
                    name="payment"
                    className="mb-2"
                    checked={paymentMethod === method}
                    onChange={() => setPaymentMethod(method)}
                  />
                  <span className="font-bold text-gray-900 uppercase">{method}</span>
                </label>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN - SUMMARY */}
        <div className="lg:col-span-4">
          <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

            <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2">
              {itemsToPurchase.map((item, idx) => (
                <div key={item.id || idx} className="flex gap-3">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                    <img src={getDirectImageUrl(item.image) || "https://placehold.co/100"} className="w-full h-full object-cover" alt={item.name} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 line-clamp-1">{item.name}</p>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    <p className="text-sm font-bold text-gray-900">₹{item.price * item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 pt-6 border-t border-gray-100">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>₹{activeSubtotal}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>{shippingCost === 0 ? <span className="text-green-600">Free</span> : `₹${shippingCost}`}</span>
              </div>
              <div className="flex justify-between font-bold text-xl text-gray-900 pt-3 border-t border-gray-100">
                <span>Total</span>
                <span>₹{finalTotal}</span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={loading}
              className="w-full mt-8 bg-black text-white font-bold py-4 rounded-xl shadow-lg hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Processing..." : `Place Order • ₹${finalTotal}`}
            </button>

            <p className="text-xs text-center text-gray-400 mt-4">
              By placing this order, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Checkout;
