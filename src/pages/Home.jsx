import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import {
  Truck,
  ShieldCheck,
  RotateCcw,
  Star,
  ChevronRight,
  ArrowRight,
  ShoppingBag,
  ExternalLink,
  Users,
  MessageCircle,
  Quote,
  ChevronDown,
  HelpCircle,
} from "lucide-react";
import { db } from "../firebase/config";
import { collection, query, limit, getDocs, where } from "firebase/firestore";
import { getDirectImageUrl } from "../utils/imageUtils";

/* ================= HERO SECTION ================= */
const Hero = () => {
  const heroRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline();
    tl.fromTo(contentRef.current.children,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.2, ease: "power3.out" }
    );
  }, []);

  return (
    <section ref={heroRef} className="relative h-[90vh] min-h-[600px] flex items-center overflow-hidden bg-black">
      {/* Dynamic Background */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=1920&q=80"
          alt="Cricket Stadium"
          className="absolute inset-0 w-full h-full object-cover opacity-60 scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 w-full">
        <div ref={contentRef} className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 bg-blue-600/10 border border-blue-500/20 backdrop-blur-md px-4 py-2 rounded-full mb-8 w-fit"
          >
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <span className="px-4 text-blue-400 text-xs font-black uppercase tracking-[0.2em]">New Season Collection</span>
          </motion.div>

          <h1 className="text-6xl md:text-8xl font-black text-white mb-6 leading-[0.9] tracking-tighter">
            DOMINATE THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600">PITCH.</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-400 mb-10 font-medium max-w-xl leading-relaxed">
            Professional grade cricket gear for those who play with fire. Experience the perfect blend of tradition and cutting-edge performance.
          </p>

          <div className="flex flex-col sm:flex-row gap-5">
            <Link
              to="/products"
              className="group relative px-10 py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 overflow-hidden transition-all hover:bg-blue-700 hover:shadow-[0_0_30px_rgba(37,99,235,0.4)]"
            >
              <ShoppingBag size={18} />
              <span>Explore Gear</span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </Link>
            <Link
              to="/trophies"
              className="px-10 py-5 bg-white/5 backdrop-blur-md border border-white/10 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-white/10 transition-all"
            >
              <span>Our Trophies</span>
              <ChevronRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ================= PRODUCT CARD ================= */
const ProductCard = ({ product }) => (
  <motion.div
    whileHover={{ y: -10 }}
    className="group bg-white rounded-[2rem] border border-gray-100 p-4 transition-all hover:shadow-2xl hover:shadow-blue-500/10"
  >
    <Link to={`/product/${product.id}`} className="block">
      <div className="relative aspect-square rounded-[1.5rem] bg-gray-50 overflow-hidden mb-6">
        <img
          src={getDirectImageUrl(product.image || product.images?.[0])}
          alt={product.name}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://placehold.co/600x400?text=Image+Unavailable";
          }}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-gray-100">
          <div className="flex items-center gap-1">
            <Star size={12} className="fill-yellow-400 text-yellow-400" />
            <span className="text-[10px] font-black text-gray-900">{product.rating || "5.0"}</span>
          </div>
        </div>
        {product.isNew && (
          <div className="absolute bottom-4 left-4 bg-blue-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
            New Arrival
          </div>
        )}
      </div>

      <div className="px-2">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-2">{product.category}</p>
        <h3 className="text-xl font-black text-gray-900 mb-3 truncate group-hover:text-blue-600 transition-colors">
          {product.name}
        </h3>

        <div className="flex items-baseline gap-3 mb-6">
          <span className="text-2xl font-black text-gray-900">₹{product.price?.toLocaleString()}</span>
          {product.mrp && (
            <span className="text-sm text-gray-400 line-through font-bold">₹{product.mrp?.toLocaleString()}</span>
          )}
        </div>

        <div className="w-full py-4 rounded-xl bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 group-hover:bg-blue-600 transition-colors">
          <span>View Details</span>
          <ArrowRight size={14} />
        </div>
      </div>
    </Link>
  </motion.div>
);

/* ================= VOICE OF PLAYERS (REVIEWS) ================= */
const VoiceOfPlayers = () => {
  const reviews = [
    { name: "Arjun Sharma", role: "State Level Player", text: "The English Willow bat I bought from here has the perfect balance and ping. Simply outstanding gear.", rating: 5 },
    { name: "Vikram Rathore", role: "Club Captain", text: "The customized jersey quality is elite. Breathable fabric and the print hasn't faded even after 20+ washes.", rating: 5 },
    { name: "Rahul Deshmukh", role: "Professional Coach", text: "Finally a store that understands what real cricketers need. Their protective gear is top-notch safety.", rating: 4.8 }
  ];

  return (
    <section className="py-24 bg-gray-50/50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-20">
          <span className="text-blue-600 font-black text-[10px] uppercase tracking-[0.3em] mb-4 block">Testimonials</span>
          <h2 className="text-5xl font-black text-gray-900 tracking-tighter">VOICE OF PLAYERS</h2>
          <div className="w-20 h-1.5 bg-blue-600 mx-auto rounded-full mt-6" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((r, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm relative group"
            >
              <Quote className="absolute top-10 right-10 text-blue-500/10 group-hover:text-blue-500/20 transition-colors" size={60} />
              <div className="flex gap-1 mb-8">
                {[...Array(5)].map((_, idx) => (
                  <Star key={idx} size={14} className={idx < Math.floor(r.rating) ? "fill-blue-600 text-blue-600" : "text-gray-200"} />
                ))}
              </div>
              <p className="text-gray-600 text-lg font-medium leading-relaxed mb-10 italic relative z-10 px-2 line-clamp-4">"{r.text}"</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-black">
                  {r.name[0]}
                </div>
                <div>
                  <h4 className="font-black text-gray-900 uppercase text-xs tracking-widest">{r.name}</h4>
                  <p className="text-blue-600 text-[10px] font-black uppercase tracking-widest">{r.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ================= ELITE FAQ ================= */
const EliteFAQ = () => {
  const [openIndex, setOpenIndex] = useState(0);
  const faqs = [
    { q: "Are the cricket bats knocked-in before delivery?", a: "We offer professional machine knocking-in services as an add-on. However, all premium bats come pre-pressed and ready for light net sessions." },
    { q: "Do you provide custom team jerseys?", a: "Yes! We specialize in custom team apparel. You can contact our design team via the community section for bulk orders and custom logos." },
    { q: "What is your return policy for protective gear?", a: "We have a 7-day 'No Questions Asked' return policy for all unused protective gear, ensuring you get the perfect fit for your safety." },
    { q: "Do you ship internationally?", a: "Currently, we ship across India. International shipping is in the works and will be launched soon for our global players." }
  ];

  return (
    <section className="py-24">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-20">
          <HelpCircle className="mx-auto text-blue-600 mb-6" size={40} />
          <h2 className="text-5xl font-black text-gray-900 tracking-tighter">ELITE SUPPORT</h2>
          <p className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.3em] mt-4">Frequently Asked Questions</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="group">
              <button
                onClick={() => setOpenIndex(openIndex === i ? -1 : i)}
                className={`w-full flex items-center justify-between p-8 rounded-3xl transition-all duration-300 border ${openIndex === i ? "bg-blue-600 border-blue-600 shadow-2xl shadow-blue-200" : "bg-white border-gray-100 hover:border-blue-600"
                  }`}
              >
                <span className={`text-lg font-black tracking-tight text-left ${openIndex === i ? "text-white" : "text-gray-900"}`}>
                  {faq.q}
                </span>
                <ChevronDown className={`transition-transform duration-300 ${openIndex === i ? "rotate-180 text-white" : "text-gray-400"}`} size={20} />
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="p-8 text-gray-500 font-medium leading-relaxed text-lg">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ================= MAIN HOME PAGE ================= */
const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productsRef = collection(db, "products");
        // Get featured products (limited to 6 or 9 for the 3-column grid)
        const q = query(productsRef, limit(9));
        const snap = await getDocs(q);
        const products = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setFeaturedProducts(products);

        // Extract categories and find the best representative image for each
        const rawCats = [...new Set(products.map(p => p.category?.trim()).filter(Boolean))];

        // Deduplicate categories case-insensitively
        const normalizedCatsMap = new Map();
        rawCats.forEach(cat => {
          const lower = cat.toLowerCase();
          if (!normalizedCatsMap.has(lower)) {
            normalizedCatsMap.set(lower, cat); // Use the first casing found (e.g., 'Cricket Bats')
          }
        });

        const uniqueCats = Array.from(normalizedCatsMap.values());

        const categoryData = uniqueCats.map(cat => {
          const lowerCat = cat.toLowerCase();
          // Find the first product in this category that actually has an image
          const productWithImage = products.find(p =>
            p.category?.toLowerCase() === lowerCat && (p.image || p.images?.[0])
          );

          // Categorical Fallbacks for common cricket gear if no product has an image
          const fallbacks = {
            "bats": "https://images.unsplash.com/photo-1593341646782-e0b495cff86d?w=800",
            "balls": "https://images.unsplash.com/photo-1589112959632-6a7ca929780b?w=800",
            "jerseys": "https://images.unsplash.com/photo-1600679472829-3044539ce8ed?w=800",
            "clothing": "https://images.unsplash.com/photo-1600679472829-3044539ce8ed?w=800",
            "accessories": "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800",
            "protective": "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=800"
          };

          const defaultFallback = "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800";

          return {
            name: cat,
            image: productWithImage?.image || productWithImage?.images?.[0] || fallbacks[lowerCat] || Object.values(fallbacks).find((v, i) => lowerCat.includes(Object.keys(fallbacks)[i])) || defaultFallback,
            count: products.filter(p => p.category?.toLowerCase() === lowerCat).length
          };
        });
        setCategories(categoryData);
      } catch (e) {
        console.error("Error fetching homepage data:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Hero />

      {/* Trust Section */}
      <section className="py-20 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { icon: <Truck />, title: "Hyper Fast Delivery", desc: "Across India in 2-5 business days" },
              { icon: <ShieldCheck />, title: "100% Authentic", desc: "Quality gear from authorized makers" },
              { icon: <RotateCcw />, title: "Elite Protection", desc: "Seamless returns for guaranteed satisfaction" }
            ].map((item, i) => (
              <div key={i} className="flex gap-6 items-start group">
                <div className="w-16 h-16 rounded-[1.25rem] bg-gray-50 flex items-center justify-center text-blue-600 transition-transform group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white">
                  {React.cloneElement(item.icon, { size: 28 })}
                </div>
                <div>
                  <h4 className="text-lg font-black text-gray-900 mb-2 uppercase tracking-wide">{item.title}</h4>
                  <p className="text-gray-500 font-medium leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-24 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="max-w-xl">
              <span className="text-blue-600 font-black text-[10px] uppercase tracking-[0.3em] mb-4 block">Shop By Discipline</span>
              <h2 className="text-5xl font-black text-gray-900 tracking-tighter leading-none">EVERYTHING FOR THE <span className="text-blue-600">MODERN</span> PLAYER.</h2>
            </div>
            <Link to="/products" className="group flex items-center gap-3 font-black text-[10px] uppercase tracking-widest text-gray-900 border-b-2 border-gray-100 pb-2 hover:border-blue-600 transition-colors">
              Explore All Gear <ExternalLink size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.slice(0, 3).map((cat, i) => (
              <Link key={i} to={`/products?category=${cat.name}`} className="group relative aspect-square overflow-hidden rounded-[3rem] bg-gray-900 shadow-xl">
                <img
                  src={getDirectImageUrl(cat.image)}
                  alt={cat.name}
                  className="w-full h-full object-cover opacity-60 transition-transform duration-700 group-hover:scale-110"
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-10 left-10">
                  <span className="text-blue-400 font-black text-[10px] uppercase tracking-[0.2em] mb-2 block">{cat.count} Items</span>
                  <h3 className="text-3xl font-black text-white uppercase tracking-tighter group-hover:text-blue-400 transition-colors">{cat.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-20">
            <span className="text-blue-600 font-black text-[10px] uppercase tracking-[0.3em] mb-4 block">Top Picks</span>
            <h2 className="text-5xl font-black text-gray-900 tracking-tighter">ELITE GEAR SELECTION</h2>
            <div className="w-20 h-1.5 bg-blue-600 mx-auto rounded-full mt-6" />
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-[4/5] bg-gray-50 rounded-[2rem] animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProducts.slice(0, 6).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      <VoiceOfPlayers />
      <EliteFAQ />

      {/* Community Section */}
      <section className="bg-black py-24 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[100px] -mr-64 -mt-64" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[100px] -ml-64 -mb-64" />

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-10 leading-none">
                JOIN THE <span className="text-blue-500">TRIBE</span> OF CHAMPIONS.
              </h2>
              <div className="space-y-8">
                {[
                  { icon: <Users />, label: "10,000+ Active Players", desc: "A community built on passion and precision." },
                  { icon: <MessageCircle />, label: "Expert Support", desc: "Get advice from seasoned pros on your equipment." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-6 items-center border border-white/5 p-8 rounded-3xl bg-white/5 backdrop-blur-sm">
                    <div className="text-blue-500">{item.icon}</div>
                    <div>
                      <h4 className="text-white font-black uppercase text-xs tracking-widest mb-1">{item.label}</h4>
                      <p className="text-gray-400 text-sm font-medium">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1593341646782-e0b495cff86d?w=800&q=80"
                alt="Community"
                className="rounded-[3rem] grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-700"
              />
              <div className="absolute -bottom-10 -right-10 bg-blue-600 p-12 rounded-[2.5rem] shadow-2xl">
                <h3 className="text-4xl font-black text-white tracking-tighter uppercase leading-none mb-2">98%</h3>
                <p className="text-blue-100 font-bold text-[10px] uppercase tracking-widest">Player Approval</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

