import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import ProductGrid from "../components/ProductGrid";
import { db } from "../firebase/config";
import { collection, onSnapshot } from "firebase/firestore";
import {
  Trophy,
  Filter,
  ArrowUpDown,
  ChevronDown,
  Search,
  X,
  SlidersHorizontal,
} from "lucide-react";

const ITEMS_PER_PAGE = 12;

const Trophies = () => {
  const navigate = useNavigate();

  const [trophies, setTrophies] = useState([]);
  const [filteredTrophies, setFilteredTrophies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [filters, setFilters] = useState({
    priceRange: [0, 100000],
    size: "all",
    material: "all",
    rating: 0,
    sortBy: "name",
    inStock: false,
  });

  const trophySizes = [
    "all",
    "Small (Under 15cm)",
    "Medium (15-25cm)",
    "Large (Over 25cm)",
  ];

  const trophyMaterials = ["all", "Metal", "Wood", "Acrylic", "Crystal"];

  const sortOptions = [
    { value: "name", label: "Name (A-Z)" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
    { value: "rating", label: "Highest Rated" },
  ];

  /* ---------------- FIREBASE FETCH ---------------- */
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "products"), (snap) => {
      const list = snap.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((p) => p.category === "trophies");

      setTrophies(list);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  /* ---------------- FILTER LOGIC ---------------- */
  useEffect(() => {
    let filtered = [...trophies];

    if (filters.size !== "all") {
      filtered = filtered.filter((t) => t.size === filters.size);
    }

    if (filters.material !== "all") {
      filtered = filtered.filter((t) => t.material === filters.material);
    }

    filtered = filtered.filter(
      (t) =>
        t.price >= filters.priceRange[0] &&
        t.price <= filters.priceRange[1]
    );

    if (filters.rating > 0) {
      filtered = filtered.filter((t) => t.rating >= filters.rating);
    }

    if (filters.inStock) {
      filtered = filtered.filter((t) => t.inStock);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.name?.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q)
      );
    }

    filtered.sort((a, b) => {
      if (filters.sortBy === "price-low") return a.price - b.price;
      if (filters.sortBy === "price-high") return b.price - a.price;
      if (filters.sortBy === "rating") return b.rating - a.rating;
      return a.name.localeCompare(b.name);
    });

    setFilteredTrophies(filtered);
  }, [filters, trophies, searchQuery]);

  // Reset page on filter/search change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, searchQuery]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      priceRange: [0, 100000],
      size: "all",
      material: "all",
      rating: 0,
      sortBy: "name",
      inStock: false,
    });
    setSearchQuery("");
  };

  const hasActiveFilters = filters.size !== "all" || filters.material !== "all" || filters.rating > 0 || filters.inStock || searchQuery;

  // Pagination
  const totalPages = Math.ceil(filteredTrophies.length / ITEMS_PER_PAGE);
  const paginatedTrophies = filteredTrophies.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* HERO HEADER */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-12 md:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tighter mb-4">
              PREMIUM <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-yellow-600">TROPHIES</span>
            </h1>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg font-medium">
              Celebrate victories with our handcrafted collection of premium trophies & awards for every occasion.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-10 pb-20">
        {/* FILTER BAR */}
        <div className="bg-white p-2 rounded-3xl shadow-2xl shadow-gray-200/50 border border-gray-100 mb-12">
          <div className="flex flex-wrap md:flex-nowrap gap-2 items-center">
            {/* Count & filter toggle */}
            <div className="flex items-center gap-2 p-1 pl-4">
              <div className="bg-amber-50 text-amber-700 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest border border-amber-100">
                {filteredTrophies.length} Trophies
              </div>
            </div>

            <div className="flex-1 flex items-center justify-end gap-2 p-1">
              {/* Filters toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold transition-all duration-300 ${showFilters
                  ? "bg-gradient-to-r from-amber-500 to-yellow-600 text-white shadow-lg shadow-amber-200"
                  : "bg-gray-50 text-gray-500 hover:bg-amber-50 hover:text-amber-600"
                  }`}
              >
                <SlidersHorizontal size={16} />
                Filters
                {hasActiveFilters && (
                  <span className="bg-white/20 rounded-full w-5 h-5 text-xs flex items-center justify-center">!</span>
                )}
              </button>

              {/* Sort */}
              <div className="relative">
                <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                  className="appearance-none pl-9 pr-8 py-2.5 bg-gray-50 rounded-2xl text-sm font-bold text-gray-700 focus:ring-2 focus:ring-amber-500 cursor-pointer border-0"
                >
                  {sortOptions.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              {/* Search */}
              <div className="hidden md:block relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search trophies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-gray-50 border-0 rounded-2xl pl-10 pr-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-amber-500 w-52 transition-all"
                />
              </div>
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
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-black uppercase tracking-widest text-gray-900">Filter Trophies</h3>
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center gap-1 transition"
                    >
                      <X size={12} /> Clear All
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {/* Size */}
                  <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Size</h4>
                    <div className="space-y-2">
                      {trophySizes.map((s) => (
                        <label key={s} className="flex items-center gap-2 text-sm cursor-pointer group">
                          <input
                            type="radio"
                            checked={filters.size === s}
                            onChange={() => handleFilterChange("size", s)}
                            className="accent-amber-600"
                          />
                          <span className="text-gray-600 group-hover:text-amber-600 font-medium transition">
                            {s === "all" ? "All Sizes" : s}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Material */}
                  <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Material</h4>
                    <div className="space-y-2">
                      {trophyMaterials.map((m) => (
                        <label key={m} className="flex items-center gap-2 text-sm cursor-pointer group">
                          <input
                            type="radio"
                            checked={filters.material === m}
                            onChange={() => handleFilterChange("material", m)}
                            className="accent-amber-600"
                          />
                          <span className="text-gray-600 group-hover:text-amber-600 font-medium transition">
                            {m === "all" ? "All Materials" : m}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Rating */}
                  <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Min Rating</h4>
                    <div className="space-y-2">
                      {[0, 3, 4, 4.5].map((r) => (
                        <label key={r} className="flex items-center gap-2 text-sm cursor-pointer group">
                          <input
                            type="radio"
                            checked={filters.rating === r}
                            onChange={() => handleFilterChange("rating", r)}
                            className="accent-amber-600"
                          />
                          <span className="text-gray-600 group-hover:text-amber-600 font-medium transition">
                            {r === 0 ? "All Ratings" : `${r}+ ★`}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Availability */}
                  <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Availability</h4>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={filters.inStock}
                          onChange={(e) => handleFilterChange("inStock", e.target.checked)}
                          className="sr-only"
                        />
                        <div className={`w-10 h-6 rounded-full transition-colors ${filters.inStock ? 'bg-amber-600' : 'bg-gray-200'}`}></div>
                        <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${filters.inStock ? 'translate-x-4' : ''}`}></div>
                      </div>
                      <span className="text-sm font-bold text-gray-600 group-hover:text-amber-600 transition">In Stock Only</span>
                    </label>
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
        ) : filteredTrophies.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trophy size={40} className="text-amber-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No trophies found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your filters or search query.</p>
            <button
              onClick={clearFilters}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-600 text-white rounded-xl font-bold hover:shadow-lg transition"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <>
            <ProductGrid products={paginatedTrophies} viewMode="grid" />

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
                      ? "bg-gradient-to-r from-amber-500 to-yellow-600 text-white shadow-lg shadow-amber-200"
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

export default Trophies;
