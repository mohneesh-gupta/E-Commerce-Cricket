import React, { createContext, useContext, useEffect, useState } from "react";
import { db } from "../firebase/config";
import { useAuth } from "./AuthContext";
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import toast from "react-hot-toast";

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isGuestCartLoaded, setIsGuestCartLoaded] = useState(false);

  /* 🔥 REAL-TIME CART */
  useEffect(() => {
    if (!currentUser) {
      const guest = localStorage.getItem("guest-cart");
      if (guest) {
        try {
          setCartItems(JSON.parse(guest));
        } catch (e) {
          console.error("Failed to parse guest cart", e);
          setCartItems([]);
        }
      } else {
        setCartItems([]);
      }
      setIsGuestCartLoaded(true);
      setLoading(false);
      return;
    }

    const cartRef = collection(db, "users", currentUser.uid, "cart");

    const unsub = onSnapshot(cartRef, (snap) => {
      const items = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setCartItems(items);
      setLoading(false);
    });

    return () => unsub();
  }, [currentUser]);

  /* 💾 SAVE GUEST CART */
  useEffect(() => {
    if (!currentUser && isGuestCartLoaded) {
      localStorage.setItem("guest-cart", JSON.stringify(cartItems));
    }
  }, [cartItems, currentUser, isGuestCartLoaded]);

  /* 🔄 MERGE GUEST CART AFTER LOGIN */
  useEffect(() => {
    if (!currentUser) return;

    const mergeGuestCart = async () => {
      const guestStr = localStorage.getItem("guest-cart");
      const guest = guestStr ? JSON.parse(guestStr) : [];

      if (guest.length > 0) {
        for (const item of guest) {
          await addToCart(item, item.quantity);
        }
        localStorage.removeItem("guest-cart");
      }
    };

    mergeGuestCart();
  }, [currentUser]);

  /* ➕ ADD / INCREMENT */
  const addToCart = async (product, qty = 1) => {
    if (!currentUser) {
      // Handle Guest Add
      setCartItems(prev => {
        const existing = prev.find(p => p.productId === product.id || p.id === product.id);
        if (existing) {
          toast.success(`Updated ${product.name} quantity`);
          return prev.map(p => (p.productId === product.id || p.id === product.id)
            ? { ...p, quantity: p.quantity + qty }
            : p
          );
        }
        toast.success(`${product.name} added to cart`);
        return [...prev, {
          id: product.id,
          productId: product.id,
          name: product.name,
          price: product.price,
          image: product.image || product.images?.[0] || "",
          quantity: qty,
          updatedAt: new Date().toISOString()
        }];
      });
      return;
    }

    if (!product?.id) {
      console.warn("addToCart: Missing user or product ID", { currentUser, product });
      return;
    }

    const ref = doc(db, "users", currentUser.uid, "cart", product.id);
    const snap = await getDoc(ref);
    const prevQty = snap.exists() ? snap.data().quantity : 0;

    await setDoc(
      ref,
      {
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.image || product.images?.[0] || "",
        quantity: prevQty + qty,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    toast.success(`${product.name} added to cart`);
  };

  /* ❌ REMOVE */
  const removeFromCart = async (productId) => {
    if (!currentUser) {
      setCartItems(prev => prev.filter(item => item.id !== productId && item.productId !== productId));
      toast.success("Item removed from cart");
      return;
    }
    await deleteDoc(doc(db, "users", currentUser.uid, "cart", productId));
    toast.success("Item removed from cart");
  };

  /* 🔁 UPDATE QTY */
  const updateQuantity = async (productId, quantity) => {
    if (quantity <= 0) return removeFromCart(productId);

    if (!currentUser) {
      setCartItems(prev => prev.map(item =>
        (item.id === productId || item.productId === productId) ? { ...item, quantity } : item
      ));
      return;
    }

    await setDoc(
      doc(db, "users", currentUser.uid, "cart", productId),
      { quantity, updatedAt: serverTimestamp() },
      { merge: true }
    );
  };

  /* 🧹 CLEAR */
  const clearCart = async () => {
    if (!currentUser) {
      setCartItems([]);
      toast.success("Cart cleared");
      return;
    }
    await Promise.all(
      cartItems.map((item) =>
        deleteDoc(doc(db, "users", currentUser.uid, "cart", item.id))
      )
    );
    toast.success("Cart cleared");
  };

  /* 💤 ABANDONED CART TRACK */
  useEffect(() => {
    if (!currentUser || cartItems.length === 0) return;

    const timer = setTimeout(async () => {
      await setDoc(
        doc(db, "abandonedCarts", currentUser.uid),
        {
          items: cartItems,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    }, 120000);

    return () => clearTimeout(timer);
  }, [cartItems, currentUser]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal: cartItems.reduce(
          (t, i) => t + i.price * i.quantity,
          0
        ),
        cartCount: cartItems.reduce((t, i) => t + i.quantity, 0),
        loading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
