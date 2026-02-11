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
} from "firebase/firestore";
import toast from "react-hot-toast";

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔄 REAL-TIME WISHLIST LISTENER
  useEffect(() => {
    if (!currentUser) {
      setWishlist([]);
      setLoading(false);
      return;
    }

    const ref = collection(db, "users", currentUser.uid, "wishlist");

    const unsub = onSnapshot(ref, (snapshot) => {
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setWishlist(items);
      setLoading(false);
    });

    return () => unsub();
  }, [currentUser]);

  // ❤️ ADD TO WISHLIST
  const addToWishlist = async (product) => {
    if (!currentUser) throw new Error("Login required");

    await setDoc(
      doc(db, "users", currentUser.uid, "wishlist", product.id),
      {
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.image || product.images?.[0] || "",
        createdAt: serverTimestamp(),
      }
    );
    toast.success(`${product.name} added to wishlist`);
  };

  // ❌ REMOVE FROM WISHLIST
  const removeFromWishlist = async (productId) => {
    if (!currentUser) return;

    await deleteDoc(
      doc(db, "users", currentUser.uid, "wishlist", productId)
    );
    toast.success("Item removed from wishlist");
  };

  // 🔍 CHECK
  const isWishlisted = (productId) =>
    wishlist.some((item) => item.productId === productId);

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        addToWishlist,
        removeFromWishlist,
        isWishlisted,
        loading,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};
