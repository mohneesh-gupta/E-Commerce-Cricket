// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from "react";
import { auth, db } from "../firebase/config";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import toast from "react-hot-toast";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        const userRef = doc(db, "users", user.uid);
        const snap = await getDoc(userRef);

        // 🔥 Auto-create user document
        if (!snap.exists()) {
          await setDoc(userRef, {
            uid: user.uid,
            email: user.email,
            role: "user", // default
            createdAt: serverTimestamp(),
          });
          setUserData({ role: "user", email: user.email });
        } else {
          setUserData(snap.data());
        }
      } else {
        setUserData(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // ✅ Login
  const login = async (email, password) => {
    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      toast.success("Logged in successfully!");
      return { success: true, user: res.user };
    } catch (err) {
      toast.error("Invalid email or password");
      return { success: false, error: "Invalid email or password" };
    }
  };

  // ✅ Register
  const register = async (email, password) => {
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      toast.success("Account created successfully!");
      return { success: true, user: res.user };
    } catch (err) {
      toast.error(err.message);
      return { success: false, error: err.message };
    }
  };

  // ✅ Logout
  const logout = async () => {
    await signOut(auth);
    toast.success("Logged out successfully!");
  };

  const value = {
    currentUser,
    userData,
    isAdmin: userData?.role === "admin",
    login,
    register,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
