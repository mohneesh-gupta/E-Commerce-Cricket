import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Star,
  Heart,
  Share2,
  ShoppingBag,
  Plus,
  Facebook,
  Instagram,
  MessageCircle,
  Copy,
  Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { getDirectImageUrl } from "../utils/imageUtils";

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isWishlisted } = useWishlist();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [showShare, setShowShare] = useState(false);
  const [copied, setCopied] = useState(false);

  const productUrl = `${window.location.origin}/product/${product.id}`;
  const wishlisted = isWishlisted(product.id);

  const toggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!currentUser) {
      return navigate("/login", { state: { from: window.location.pathname } });
    }

    try {
      if (wishlisted) {
        await removeFromWishlist(product.id);
      } else {
        await addToWishlist(product);
      }
    } catch (err) {
      toast.error(err.message || "Something went wrong");
    }
  };

  const handleShare = (platform) => {
    const text = `Check out this ${product.name} at GS Sports!`;
    let url = "";

    switch (platform) {
      case "whatsapp":
        url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text + " " + productUrl)}`;
        break;
      case "facebook":
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`;
        break;
      case "instagram":
        // Instagram doesn't have a direct share URL for web links, copy to clipboard as fallback
        copyToClipboard();
        return;
      case "copy":
        copyToClipboard();
        return;
      default:
        return;
    }
    window.open(url, "_blank");
    setShowShare(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(productUrl);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      className="group relative bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-2xl hover:shadow-blue-200/50 transition-all duration-500 flex flex-col h-full cursor-pointer"
      onClick={() => navigate(`/product/${product.id}`)}
    >
      {/* IMAGE CONTAINER */}
      <div className="relative bg-gray-50 overflow-hidden">
        <div className="w-full flex justify-center bg-white">
          <motion.img
            src={getDirectImageUrl(product.image || product.images?.[0])}
            alt={product.name}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://placehold.co/600x400?text=Image+Unavailable";
            }}
            className="max-w-full h-auto min-h-[200px] max-h-[300px] object-contain transition-transform duration-700 group-hover:scale-110"
          />
        </div>

        {/* TOP BADGES */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.discount > 0 && (
            <span className="bg-blue-600 text-white text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-wider shadow-sm shadow-blue-200">
              {product.discount}% OFF
            </span>
          )}
          {product.stock <= 5 && product.stock > 0 && (
            <span className="bg-orange-500 text-white text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-wider">
              Low Stock
            </span>
          )}
          {product.stock === 0 && (
            <span className="bg-gray-400 text-white text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-wider">
              Sold Out
            </span>
          )}
        </div>

        {/* HOVER ACTIONS - WISHLIST */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
          <button
            onClick={toggleWishlist}
            className={`p-2.5 rounded-full shadow-lg transition-all duration-300 ${wishlisted
              ? "bg-red-500 text-white scale-110"
              : "bg-white text-gray-900 hover:bg-blue-600 hover:text-white"
              }`}
          >
            <Heart size={18} fill={wishlisted ? "currentColor" : "none"} />
          </button>
        </div>

        {/* BOTTOM ACTIONS - SHARE & QUICK VIEW */}
        <div className="absolute bottom-4 left-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
          <div className="relative flex-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowShare(!showShare);
              }}
              className="w-full bg-white/90 backdrop-blur-md text-gray-900 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-blue-600 hover:text-white transition-all shadow-xl"
            >
              <Share2 size={14} /> Share
            </button>

            <AnimatePresence>
              {showShare && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.9 }}
                  onClick={(e) => e.stopPropagation()}
                  className="absolute bottom-full left-0 mb-2 w-max bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden flex p-1 gap-1 z-20"
                >
                  <button onClick={(e) => { e.stopPropagation(); handleShare("whatsapp"); }} className="p-2.5 hover:bg-green-50 text-green-600 rounded-lg transition-colors">
                    <MessageCircle size={18} />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleShare("facebook"); }} className="p-2.5 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors">
                    <Facebook size={18} />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleShare("instagram"); }} className="p-2.5 hover:bg-pink-50 text-pink-600 rounded-lg transition-colors">
                    <Instagram size={18} />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); copyToClipboard(); }} className="p-2.5 hover:bg-gray-100 text-gray-600 rounded-lg transition-colors">
                    {copied ? <Check size={18} className="text-green-600" /> : <Copy size={18} />}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              if (!currentUser) return navigate("/login", { state: { from: window.location.pathname } });
              addToCart({ ...product, quantity: 1 });
            }}
            className="bg-blue-600 text-white p-2.5 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-blue-200/50"
            disabled={product.stock === 0}
          >
            <Plus size={18} />
          </button>
        </div>


      </div>

      {/* INFO CONTAINER */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
          <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
            {product.category || "Cricket"}
          </span>
          <div className="flex items-center gap-1">
            <Star size={12} className="fill-yellow-400 text-yellow-400" />
            <span className="text-[10px] font-bold text-gray-700">{product.rating || "4.5"}</span>
          </div>
        </div>

        <div className="flex-1">
          <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
            {product.name}
          </h3>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xl font-bold text-black tracking-tight">
              ₹{product.price?.toLocaleString()}
            </span>
            {product.mrp && (
              <span className="text-[10px] text-gray-400 line-through">
                ₹{product.mrp?.toLocaleString()}
              </span>
            )}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              if (!currentUser) return navigate("/login", { state: { from: window.location.pathname } });
              navigate("/checkout", { state: { buyNowItem: { ...product, quantity: 1 } } });
            }}
            className="flex items-center gap-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white px-4 py-2 rounded-xl transition-all duration-300 text-xs font-bold border border-blue-100"
            disabled={product.stock === 0}
          >
            <ShoppingBag size={14} /> Buy
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
