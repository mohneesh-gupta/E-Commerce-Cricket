import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { doc, getDoc, addDoc, collection, updateDoc, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import ProductImageGallery from "../components/ProductImageGallery";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import {
  Star,
  Heart,
  ShoppingBag,
  ShieldCheck,
  Truck,
  RotateCcw,
  ArrowLeft,
  ChevronRight,
  Plus,
  Minus,
  MessageSquare
} from "lucide-react";

import toast from "react-hot-toast";

const REVIEWS_PER_PAGE = 5;

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isWishlisted } = useWishlist();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");

  // Reviews State
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const docRef = doc(db, "products", id);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          setProduct({ id: snap.id, ...data });
        } else {
          toast.error("Product not found");
          navigate("/products");
        }
      } catch (e) { console.error(e); }
    };

    const fetchReviews = async () => {
      try {
        const q = query(collection(db, "products", id, "reviews"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        setReviews(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) {
        console.error("Error fetching reviews", e);
      }
    };

    fetchProduct();
    fetchReviews();
    setCurrentPage(1);
  }, [id, navigate]);

  const handleAddToCart = async () => {
    if (product.stock <= 0) {
      toast.error("This item is currently out of stock");
      return;
    }

    if (!currentUser) {
      return navigate("/login", { state: { from: `/product/${id}` } });
    }

    try {
      await addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image || product.images?.[0] || "",
        quantity,
      });
    } catch (e) {
      console.error("Cart Error", e);
      toast.error("Failed to add to cart");
    }
  };

  const handleBuyNow = async () => {
    if (product.stock <= 0) {
      toast.error("This item is currently out of stock");
      return;
    }

    if (!currentUser) {
      return navigate("/login", { state: { from: `/product/${id}` } });
    }

    // Direct checkout for this item only
    navigate("/checkout", {
      state: {
        buyNowItem: {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.images?.[0] || "",
          quantity,
        }
      }
    });
  };

  const toggleWishlist = async () => {
    if (!currentUser) {
      return navigate("/login", { state: { from: `/product/${id}` } });
    }

    try {
      if (isWishlisted(id)) {
        await removeFromWishlist(id);
      } else {
        await addToWishlist({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image || product.images?.[0] || "",
        });
      }
    } catch (e) {
      toast.error("Wishlist update failed");
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!currentUser) return toast.error("Please Login to review");
    setSubmittingReview(true);

    try {
      const reviewData = {
        userId: currentUser.uid,
        userName: currentUser.displayName || currentUser.email.split("@")[0],
        rating: Number(newReview.rating),
        comment: newReview.comment,
        createdAt: new Date(),
      };

      await addDoc(collection(db, "products", id, "reviews"), reviewData);

      const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0) + reviewData.rating;
      const newCount = reviews.length + 1;
      const newAverage = Math.round((totalRating / newCount) * 10) / 10;

      await updateDoc(doc(db, "products", id), {
        rating: newAverage,
        reviewsCount: newCount
      });

      setReviews([reviewData, ...reviews]);
      setProduct({ ...product, rating: newAverage, reviewsCount: newCount });
      setNewReview({ rating: 5, comment: "" });
      toast.success("Review Submitted!");
      setCurrentPage(1);

    } catch (error) {
      console.error("Review failed", error);
      toast.error("Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (!product) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="font-bold text-blue-600/50 uppercase tracking-widest text-xs">Loading Gear...</p>
    </div>
  );

  const isInWishlist = isWishlisted(product.id);

  return (
    <div className="bg-white min-h-screen pb-20 pt-4">
      <div className="max-w-7xl mx-auto px-4">

        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 mb-8 text-xs font-bold uppercase tracking-widest">
          <Link to="/" className="text-gray-400 hover:text-blue-600 transition-colors">Home</Link>
          <ChevronRight size={12} className="text-gray-300" />
          <Link to="/products" className="text-gray-400 hover:text-blue-600 transition-colors">Products</Link>
          <ChevronRight size={12} className="text-gray-300" />
          <span className="text-blue-600">{product.name}</span>
        </nav>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">

          {/* Left: Gallery */}
          <div className="w-full">
            <ProductImageGallery images={product.images || []} isNew={product.isNew} />
          </div>

          {/* Right: Info */}
          <div className="flex flex-col">
            <div className="mb-6">
              <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full uppercase tracking-widest text-[10px] font-black border border-blue-100">{product.category}</span>
              <h1 className="text-4xl md:text-5xl font-black text-gray-900 mt-4 leading-tight tracking-tighter">{product.name}</h1>
              {product.tagline && (
                <p className="text-xl text-gray-400 font-medium mt-2">"{product.tagline}"</p>
              )}

              <div className="flex items-center gap-6 mt-6">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={18}
                      className={i < Math.round(product.rating || 0) ? "fill-blue-600 text-blue-600" : "text-gray-200"}
                    />
                  ))}
                  <span className="ml-2 text-sm font-black text-gray-900">{product.rating || "0.0"}</span>
                </div>
                <div className="h-4 w-px bg-gray-200"></div>
                <span className="text-gray-400 text-sm font-bold uppercase tracking-wider">{product.reviewsCount || 0} Customer Reviews</span>
              </div>
            </div>

            <div className="flex items-baseline gap-4 mb-8">
              <span className="text-5xl font-black text-blue-900 tracking-tight">₹{product.price?.toLocaleString()}</span>
              {product.mrp && <span className="text-2xl text-gray-300 line-through font-medium">₹{product.mrp?.toLocaleString()}</span>}
              {product.discount > 0 && <span className="text-green-600 text-lg font-black">{product.discount}% OFF</span>}
            </div>

            {/* Stock Status */}
            <div className="mb-8">
              {product.stock > 0 ? (
                <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-2xl font-black text-xs uppercase tracking-widest border border-green-100">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  Ready to Ship ({product.stock} units)
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 bg-red-50 text-red-700 px-4 py-2 rounded-2xl font-black text-xs uppercase tracking-widest border border-red-100">
                  <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                  Sold Out
                </div>
              )}
            </div>

            <p className="text-gray-500 leading-relaxed text-lg font-medium mb-10">{product.description}</p>

            {/* Actions */}
            <div className="mt-auto p-8 bg-gray-50 rounded-3xl border border-gray-100">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center bg-white rounded-2xl border border-gray-200 shadow-sm">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-4 text-gray-400 hover:text-blue-600 transition-colors"><Minus size={18} /></button>
                  <span className="font-black w-10 text-center text-lg">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="p-4 text-gray-400 hover:text-blue-600 transition-colors"><Plus size={18} /></button>
                </div>
                <button
                  onClick={toggleWishlist}
                  className={`p-4 rounded-2xl border-2 transition-all duration-300 shadow-md ${isInWishlist ? 'bg-red-500 border-red-500 text-white scale-110 shadow-red-200/50' : 'bg-white border-gray-200 text-gray-400 hover:border-blue-600 hover:text-blue-600'}`}
                >
                  <Heart size={24} fill={isInWishlist ? "currentColor" : "none"} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={handleAddToCart}
                  className={`w-full py-5 rounded-2xl border-2 font-black text-xs uppercase tracking-widest transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2 ${product.stock === 0 ? 'border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50' : 'border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white shadow-blue-200/50'}`}
                >
                  <ShoppingBag size={18} /> {product.stock === 0 ? "Out of Stock" : "Add To Bag"}
                </button>
                <button
                  onClick={handleBuyNow}
                  className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-2xl active:scale-95 ${product.stock === 0 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-blue-200/50'}`}
                >
                  Buy Now
                </button>
              </div>
            </div>

            {/* Basic Badges */}
            <div className="mt-10 grid grid-cols-3 gap-4">
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="p-3 bg-gray-50 rounded-2xl text-black"><Truck size={20} /></div>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Fast Shipping</span>
              </div>
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="p-3 bg-gray-50 rounded-2xl text-black"><ShieldCheck size={20} /></div>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">100% Genuine</span>
              </div>
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="p-3 bg-gray-50 rounded-2xl text-black"><RotateCcw size={20} /></div>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Easy Returns</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabbed Content Section */}
        <div className="border-t border-gray-100 pt-12">
          <div className="flex justify-center gap-8 mb-12">
            {['description', 'specifications', 'highlights'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 px-2 font-black text-xs uppercase tracking-[0.3em] transition-all relative ${activeTab === tab
                  ? 'text-blue-600'
                  : 'text-gray-300 hover:text-blue-400'
                  }`}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div layoutId="tabLine" className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-full" />
                )}
              </button>
            ))}
          </div>

          <div className="max-w-4xl mx-auto py-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="text-gray-500 text-lg font-medium leading-relaxed"
              >
                {activeTab === 'description' && (
                  <p>{product.description}</p>
                )}

                {activeTab === 'specifications' && (
                  (product.specifications || product.specs) ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                      {Object.entries(product.specifications || product.specs).map(([key, value]) => (
                        <div key={key} className="flex justify-between border-b border-gray-100 pb-4">
                          <span className="font-black text-xs uppercase tracking-widest text-gray-900">{key.replace(/_/g, ' ')}</span>
                          <span className="text-gray-500">{value}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <p className="text-gray-400">No technical specifications available for this product.</p>
                    </div>
                  )
                )}

                {activeTab === 'highlights' && (
                  product.highlights && product.highlights.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {product.highlights.map((highlight, index) => (
                        <div key={index} className="flex items-start gap-3 bg-gray-50 p-6 rounded-3xl border border-gray-100">
                          <div className="mt-1 text-blue-600"><ShieldCheck size={18} /></div>
                          <span className="text-gray-700 font-bold">{highlight}</span>
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-center py-10">Product highlights are coming soon.</p>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-32 max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900 tracking-tighter mb-4">VOICES OF PLAYERS</h2>
            <div className="w-20 h-1.5 bg-blue-600 mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Review Form */}
            <div className="lg:col-span-1">
              {currentUser ? (
                <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100 sticky top-24">
                  <h3 className="font-black text-xs uppercase tracking-widest mb-6">Write A Review</h3>
                  <form onSubmit={handleSubmitReview}>
                    <div className="flex items-center gap-2 mb-6">
                      {[1, 2, 3, 4, 5].map(s => (
                        <button type="button" key={s} onClick={() => setNewReview({ ...newReview, rating: s })} className="transition-transform active:scale-90">
                          <Star
                            size={24}
                            className={s <= newReview.rating ? "fill-blue-600 text-blue-600" : "text-gray-200"}
                          />
                        </button>
                      ))}
                    </div>
                    <textarea
                      className="w-full bg-white border border-gray-100 rounded-2xl p-5 h-40 mb-6 text-sm font-medium focus:ring-2 focus:ring-blue-600 outline-none transition-all shadow-sm"
                      placeholder="Share your experience with this gear..."
                      value={newReview.comment}
                      onChange={e => setNewReview({ ...newReview, comment: e.target.value })}
                      required
                    />
                    <button
                      disabled={submittingReview}
                      className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-blue-100"
                    >
                      {submittingReview ? "Submitting..." : "Post Review"}
                    </button>
                  </form>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-3xl p-10 text-center sticky top-24 shadow-2xl shadow-blue-200/50">
                  <MessageSquare size={40} className="mx-auto mb-6 text-white/50" />
                  <h3 className="font-black text-lg mb-4 text-white">AUTHENTIC PLAYER FEEDBACK</h3>
                  <p className="text-white/60 text-sm mb-8 font-medium">Please login to join the conversation and share your feedback on this gear.</p>
                  <Link to="/login" className="block w-full bg-white text-blue-600 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-50 transition-all">Login To Review</Link>
                </div>
              )}
            </div>

            {/* Review List */}
            <div className="lg:col-span-2 space-y-8">
              {reviews.length > 0 ? (
                <>
                  <div className="space-y-8">
                    {reviews.slice((currentPage - 1) * REVIEWS_PER_PAGE, currentPage * REVIEWS_PER_PAGE).map(r => (
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        key={r.id}
                        className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm"
                      >
                        <div className="flex justify-between items-start mb-6">
                          <div>
                            <span className="block font-black text-sm uppercase tracking-wider text-black">{r.userName}</span>
                            <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest mt-1">
                              {r.createdAt?.toDate ? r.createdAt.toDate().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'Verified Player'}
                            </span>
                          </div>
                          <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={14}
                                className={i < r.rating ? "fill-blue-600 text-blue-600" : "text-gray-100"}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-500 font-medium leading-relaxed italic">"{r.comment}"</p>
                      </motion.div>
                    ))}
                  </div>

                  {/* Pagination Controls */}
                  {reviews.length > REVIEWS_PER_PAGE && (
                    <div className="flex items-center justify-between pt-8">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="flex items-center gap-2 font-black text-[10px] uppercase tracking-widest text-gray-400 hover:text-blue-600 disabled:opacity-30 transition-colors"
                      >
                        <ArrowLeft size={16} /> Previous
                      </button>

                      <div className="flex gap-2">
                        {Array.from({ length: Math.ceil(reviews.length / REVIEWS_PER_PAGE) }).map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setCurrentPage(i + 1)}
                            className={`w-8 h-8 rounded-full text-[10px] font-black transition-all ${currentPage === i + 1
                              ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                              : "text-gray-400 hover:bg-gray-100"
                              }`}
                          >
                            {i + 1}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(reviews.length / REVIEWS_PER_PAGE)))}
                        disabled={currentPage === Math.ceil(reviews.length / REVIEWS_PER_PAGE)}
                        className="flex items-center gap-2 font-black text-[10px] uppercase tracking-widest text-gray-400 hover:text-blue-600 disabled:opacity-30 transition-colors"
                      >
                        Next <ChevronRight size={16} />
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                  <MessageSquare size={40} className="mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Be the first to review this gear</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
