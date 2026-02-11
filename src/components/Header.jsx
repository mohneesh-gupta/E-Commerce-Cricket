import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";
import {
  Bars3Icon,
  XMarkIcon,
  ShoppingCartIcon,
  HeartIcon, // Added HeartIcon
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  ShoppingBagIcon,
  TrophyIcon,
} from "@heroicons/react/24/outline";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // Removed isScrolled state
  const [showProfile, setShowProfile] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  const { cartCount } = useCart();
  const { wishlist } = useWishlist();
  const { currentUser, userData, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Scroll handler for navbar visibility
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (!isMenuOpen && currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isMenuOpen]);

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Products", path: "/products" },
    { name: "Trophies", path: "/trophies" },
  ];

  const handleLogout = async () => {
    await logout();
    setShowProfile(false);
    navigate("/login");
  };

  return (

    <header className={`fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50 transition-transform duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">

          {/* LOGO */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="bg-gradient-to-tr from-blue-600 to-indigo-700 text-white p-2 rounded-lg group-hover:rotate-12 transition-transform duration-300 shadow-lg shadow-blue-200">
              <TrophyIcon className="h-6 w-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tighter uppercase text-blue-900 leading-none">GS Sports</span>
            </div>
          </Link>

          {/* DESKTOP NAV */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `px-5 py-2.5 rounded-full text-sm font-bold transition-all ${isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                    : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                  }`
                }
              >
                {item.name}
              </NavLink>
            ))}
          </div>

          {/* RIGHT ACTIONS */}
          <div className="flex items-center gap-4">

            {/* CART */}
            <Link to="/cart" className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors group">
              <ShoppingCartIcon className="h-7 w-7" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* AUTH / PROFILE */}
            {!currentUser ? (
              <div className="hidden md:flex items-center gap-3">
                <Link to="/login" className="px-4 py-2 text-sm font-bold text-gray-700 hover:text-black">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold rounded-full hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-100"
                >
                  Sign Up
                </Link>
              </div>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setShowProfile((p) => !p)}
                  className="flex items-center gap-2 focus:outline-none"
                >
                  <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold shadow-md hover:ring-2 hover:ring-offset-2 hover:ring-blue-600 transition-all">
                    {currentUser.email ? currentUser.email[0].toUpperCase() : <UserCircleIcon className="h-6 w-6" />}
                  </div>
                </button>

                {/* DROPDOWN */}
                <AnimatePresence>
                  {showProfile && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 ring-1 ring-black ring-opacity-5 overflow-hidden z-[100]"
                    >
                      <div className="bg-gray-50 px-5 py-4 border-b border-gray-100">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Signed in as</p>
                        <p className="text-sm font-bold text-gray-900 break-words">{currentUser.email}</p>
                      </div>

                      <div className="p-2 space-y-1">
                        {userData?.role === "admin" && (
                          <Link to="/admin" onClick={() => setShowProfile(false)} className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-purple-600 rounded-lg hover:bg-purple-50">
                            <span>⚡</span> Admin Dashboard
                          </Link>
                        )}
                        <Link to="/profile" onClick={() => setShowProfile(false)} className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-blue-50 hover:text-blue-600">
                          <UserCircleIcon className="h-5 w-5" /> My Profile
                        </Link>
                        <Link to="/orders" onClick={() => setShowProfile(false)} className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-blue-50 hover:text-blue-600">
                          <ShoppingBagIcon className="h-5 w-5" /> My Orders
                        </Link>
                        <Link to="/wishlist" onClick={() => setShowProfile(false)} className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-blue-50 hover:text-blue-600">
                          <HeartIcon className="h-5 w-5" /> My Wishlist
                          {wishlist.length > 0 && <span className="ml-auto bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">{wishlist.length}</span>}
                        </Link>

                        <div className="h-px bg-gray-100 my-1" />

                        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 text-left">
                          <ArrowRightOnRectangleIcon className="h-5 w-5" /> Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* MOBILE MENU TOGGLE */}
            <button
              onClick={() => setIsMenuOpen((p) => !p)}
              className="md:hidden p-2 text-gray-600 hover:text-black"
            >
              {isMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-white border-t border-gray-100 overflow-hidden"
          >
            <div className="p-4 space-y-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={({ isActive }) =>
                    `block px-4 py-3 rounded-xl text-sm font-bold ${isActive
                      ? "bg-blue-600 text-white shadow-lg"
                      : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                    }`
                  }
                >
                  {item.name}
                </NavLink>
              ))}
              {!currentUser && (
                <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-100">
                  <Link to="/login" onClick={() => setIsMenuOpen(false)} className="py-2.5 text-center border-2 border-gray-200 rounded-xl font-bold text-gray-700 hover:border-blue-200 hover:text-blue-600">Login</Link>
                  <Link to="/register" onClick={() => setIsMenuOpen(false)} className="py-2.5 text-center bg-blue-600 text-white rounded-xl font-bold">Sign Up</Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
