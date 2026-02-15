import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Filter,
  ArrowUpDown,
  ChevronDown,
  Search,
  LayoutGrid,
  Activity,
  Shield,
  Dribbble,
  Package
} from "lucide-react";
import ProductGrid from "../components/ProductGrid";
import { db } from "../firebase/config";
import { collection, onSnapshot } from "firebase/firestore";

const getCategoryIcon = (category) => {
  const cat = category.toLowerCase();
  if (cat.includes("bat")) return <Dribbble size={18} />;
  if (cat.includes("ball")) return <Activity size={18} />;
  if (cat.includes("protect") || cat.includes("guard")) return <Shield size={18} />;
  if (cat.includes("accessory") || cat.includes("extra")) return <LayoutGrid size={18} />;
  if (cat.includes("trophy") || cat.includes("award")) return <Trophy size={18} />;
  return <Package size={18} />;
};

const PRODUCTS_PER_PAGE = 12;

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([{ id: "all", label: "All Gear", icon: <Package size={18} /> }]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [filters, setFilters] = useState({
    category: "all",
    sortBy: "newest",
    inStock: false,
  });

  /* 🔥 FETCH PRODUCTS FROM FIRESTORE */
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "products"), (snap) => {
      const list = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(list.filter(p => !p.category?.toLowerCase().includes("trophi")));

      // Extract unique categories
      const uniqueCats = ["all", ...new Set(list
        .filter(p => !p.category?.toLowerCase().includes("trophi"))
        .map((p) => p.category)
        .filter(Boolean))];
      const categoriesList = uniqueCats.map((cat) => ({
        id: cat,
        label: cat === "all" ? "All Gear" : cat.charAt(0).toUpperCase() + cat.slice(1),
        icon: getCategoryIcon(cat),
      }));
      setCategories(categoriesList);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  /* 🔁 FILTER + SORT */
  useEffect(() => {
    let list = [...products];

    // Category
    if (filters.category !== "all") {
      list = list.filter((p) => p.category?.toLowerCase() === filters.category.toLowerCase());
    }

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter((p) =>
        p.name?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
      );
    }

    // Stock
    if (filters.inStock) {
      list = list.filter((p) => p.stock > 0);
    }

    // Sort
    if (filters.sortBy === "price-low") {
      list.sort((a, b) => a.price - b.price);
    } else if (filters.sortBy === "price-high") {
      list.sort((a, b) => b.price - a.price);
    } else if (filters.sortBy === "rating") {
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else {
      // Default newest/name
      list.sort((a, b) => a.name.localeCompare(b.name));
    }

    setFiltered(list);
  }, [filters, products, searchQuery]);

  // Reset to page 1 when filters/search change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, searchQuery]);

  const changeFilter = (key, value) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  // Pagination
  const totalPages = Math.ceil(filtered.length / PRODUCTS_PER_PAGE);
  const paginatedProducts = filtered.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* HEADER SECTION */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-12 md:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tighter mb-4">
              EQUIP YOUR <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">GAME</span>
            </h1>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg font-medium">
              Explore our premium collection of professional cricket gear, curated for the champions of tomorrow.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-10 pb-20">
        {/* INTERACTIVE CATEGORY BAR */}
        <div className="bg-white p-2 rounded-3xl shadow-2xl shadow-gray-200/50 border border-gray-100 mb-12">
          <div className="flex flex-wrap md:flex-nowrap gap-2">
            <div className="flex-1 flex gap-2 overflow-x-auto p-1 pb-3 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => changeFilter("category", cat.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-300 whitespace-nowrap ${filters.category === cat.id
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-200 scale-105"
                    : "bg-gray-50 text-gray-500 hover:bg-blue-50 hover:text-blue-600"
                    }`}
                >
                  {cat.icon}
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="hidden md:flex border-l border-gray-100 pl-4 items-center pr-2">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                <input
                  type="text"
                  placeholder="Search gear..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-gray-50 border-0 rounded-2xl pl-12 pr-6 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-600 w-64 transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* TOOLS & FILTERS */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border border-blue-100">
              {filtered.length} Items Found
            </div>
            {filters.category !== 'all' && (
              <button
                onClick={() => changeFilter('category', 'all')}
                className="text-xs font-bold text-gray-400 hover:text-red-500 transition-colors"
              >
                Clear Category
              </button>
            )}
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold border transition-all ${showFilters ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100" : "bg-white text-gray-700 border-gray-200 hover:border-blue-600 hover:text-blue-600"
                }`}
            >
              <Filter size={16} /> Filters
              <ChevronDown size={14} className={`transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            <div className="relative flex-1 md:flex-none">
              <ArrowUpDown className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
              <select
                value={filters.sortBy}
                onChange={(e) => changeFilter("sortBy", e.target.value)}
                className="w-full md:w-48 appearance-none pl-12 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-600 text-gray-700 cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
              <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* EXPANDABLE FILTER PANEL */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, y: -20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -20, height: 0 }}
              className="overflow-hidden mb-12"
            >
              <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-xl shadow-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div>
                    <h4 className="text-sm font-black uppercase tracking-widest text-gray-900 mb-4">Availability</h4>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={filters.inStock}
                          onChange={(e) => changeFilter("inStock", e.target.checked)}
                          className="sr-only p-2"
                        />
                        <div className={`w-10 h-6 rounded-full transition-colors ${filters.inStock ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                        <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${filters.inStock ? 'translate-x-4' : ''}`}></div>
                      </div>
                      <span className="text-sm font-bold text-gray-600 group-hover:text-blue-600">Hide out of stock</span>
                    </label>
                  </div>

                  <div className="md:col-span-2">
                    <h4 className="text-sm font-black uppercase tracking-widest text-gray-900 mb-4">Search By Keyword</h4>
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                      <input
                        type="text"
                        placeholder="E.g. English Willow, Leather Ball..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-gray-50 border-gray-100 rounded-2xl pl-12 pr-6 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-600 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* PRODUCT GRID */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="aspect-[4/5] bg-white rounded-2xl animate-pulse flex flex-col p-5 border border-gray-100"
              >
                <div className="flex-1 bg-gray-100 rounded-xl mb-4" />
                <div className="h-4 bg-gray-100 rounded w-2/3 mb-2" />
                <div className="h-3 bg-gray-50 rounded w-1/2 mb-6" />
                <div className="flex justify-between items-center">
                  <div className="h-6 bg-gray-100 rounded w-20" />
                  <div className="h-10 bg-gray-100 rounded w-24 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="h-[80vh] overflow-y-auto pr-2 custom-scrollbar">
              <ProductGrid products={paginatedProducts} />
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center mt-12 gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm font-bold rounded-xl border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  ← Previous
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => { setCurrentPage(page); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className={`w-10 h-10 text-sm font-bold rounded-xl transition ${currentPage === page
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-200"
                      : "border border-gray-200 bg-white hover:bg-gray-50 text-gray-700"
                      }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 text-sm font-bold rounded-xl border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Products;
