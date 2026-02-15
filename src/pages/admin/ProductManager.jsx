import React, { useState, useEffect } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../firebase/config";
import {
  FaBoxOpen,
  FaEdit,
  FaTrash,
  FaPlus,
  FaSearch,
  FaSave,
  FaTimes,
  FaImage,
  FaTag,
  FaWarehouse,
  FaRupeeSign,
  FaList
} from "react-icons/fa";
import ConfirmModal from "../../components/ConfirmModal";

const CATEGORIES = [
  "Cricket Bats",
  "Cricket Balls",
  "Trophies",
  "Kit Bags",
  "Accessories",
  "Shoes",
  "Clothing",
];

const ProductManager = () => {
  const [products, setProducts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: "",
    subtitle: "",
    description: "",
    manufacturer: "",
    price: "",
    mrp: "",
    category: "Cricket Bats",
    images: [""],
    stock: 10,
    rating: 0,
    reviewsCount: 0,
    highlights: "",
    specs: "",
  });

  // Confirm Modal State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
    type: "danger"
  });

  const fetchProducts = async () => {
    const snap = await getDocs(collection(db, "products"));
    setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const resetForm = () => {
    setForm({
      name: "",
      subtitle: "",
      description: "",
      manufacturer: "",
      price: "",
      mrp: "",
      category: "Cricket Bats",
      images: [""],
      stock: 10,
      rating: 0,
      reviewsCount: 0,
      highlights: "",
      specs: "",
    });
    setEditingId(null);
  };

  const handleEdit = (product) => {
    // Convert arrays/objects back to string format for editing
    const highlightsStr = product.highlights ? product.highlights.join("\n") : "";
    const specsStr = product.specs
      ? Object.entries(product.specs)
        .map(([k, v]) => `${k}: ${v}`)
        .join("\n")
      : "";

    setForm({
      name: product.name || "",
      subtitle: product.subtitle || "",
      description: product.description || "",
      manufacturer: product.manufacturer || "",
      price: product.price || "",
      mrp: product.mrp || "",
      category: product.category || "Cricket Bats",
      images: product.images && product.images.length ? product.images : [""],
      stock: product.stock || 0,
      rating: product.rating || 0,
      reviewsCount: product.reviewsCount || 0,
      highlights: highlightsStr,
      specs: specsStr,
    });
    setEditingId(product.id);
    // Scroll to top to see form
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();

    // Calculate discount
    const price = Number(form.price);
    const mrp = Number(form.mrp);
    let discount = 0;
    if (mrp > price) {
      discount = Math.round(((mrp - price) / mrp) * 100);
    }

    // Parse highlights
    const highlightsArray = form.highlights
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    // Parse specs
    const specsObject = {};
    form.specs.split("\n").forEach((line) => {
      const parts = line.split(":");
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const value = parts.slice(1).join(":").trim();
        if (key && value) {
          specsObject[key] = value;
        }
      }
    });

    const productData = {
      name: form.name,
      subtitle: form.subtitle,
      description: form.description,
      manufacturer: form.manufacturer,
      price: price,
      mrp: mrp > 0 ? mrp : null,
      discount: discount,
      category: form.category,
      images: form.images.map((i) => i.trim()).filter(Boolean),
      stock: Number(form.stock),
      rating: Number(form.rating),
      reviewsCount: Number(form.reviewsCount),
      inStock: Number(form.stock) > 0,
      highlights: highlightsArray,
      specs: specsObject,
      updatedAt: new Date(),
    };

    if (editingId) {
      await updateDoc(doc(db, "products", editingId), productData);
    } else {
      await addDoc(collection(db, "products"), {
        ...productData,
        createdAt: new Date(),
      });
    }

    resetForm();
    fetchProducts();
  };

  const deleteProduct = async (id) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Product?",
      message: "Are you sure you want to delete this product? This action cannot be undone.",
      type: "danger",
      onConfirm: () => performDelete(id)
    });
  };

  const performDelete = async (id) => {
    await deleteDoc(doc(db, "products", id));
    fetchProducts();
  };

  return (
    <div className="max-w-7xl mx-auto pb-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
            <FaBoxOpen className="text-indigo-600" /> Product Manager
          </h1>
          <p className="mt-1 text-gray-500">Manage your inventory, pricing, and product details.</p>
        </div>
      </div>

      <form onSubmit={handleSaveProduct} className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* LEFT COLUMN - MAIN INFO (2 Cols wide) */}
        <div className="lg:col-span-2 space-y-6">

          {/* ESSENTIALS CARD */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
              {editingId ? <FaEdit className="text-indigo-500" /> : <FaPlus className="text-indigo-500" />}
              {editingId ? "Edit Product Details" : "Basic Information"}
            </h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                <input
                  placeholder="e.g. RS 35 Players Edition"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition bg-gray-50 focus:bg-white"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <div className="relative">
                    <select
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 outline-none bg-gray-50 focus:bg-white appearance-none"
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      required
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <FaList className="text-gray-400" />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle / Tagline</label>
                  <input
                    placeholder="e.g. ~ God's Plan..."
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 outline-none bg-gray-50 focus:bg-white"
                    value={form.subtitle}
                    onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturer Details</label>
                <input
                  placeholder="e.g. Delux Sports Company, Punjab"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 outline-none bg-gray-50 focus:bg-white"
                  value={form.manufacturer}
                  onChange={(e) => setForm({ ...form, manufacturer: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* DETAIL CONTENT CARD */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
              <FaList className="text-indigo-500" /> Content & Specifications
            </h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Long Description</label>
                <textarea
                  rows="4"
                  placeholder="Detailed product story..."
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 outline-none bg-gray-50 focus:bg-white"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Highlights (One per line)</label>
                  <textarea
                    rows="5"
                    placeholder="Grade 1 Willow&#10;Lightweight Pickup&#10;..."
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 outline-none bg-gray-50 focus:bg-white font-mono text-sm"
                    value={form.highlights}
                    onChange={(e) => setForm({ ...form, highlights: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Specifications (Key: Value)</label>
                  <textarea
                    rows="5"
                    placeholder="Material: English Willow&#10;Weight: 1180g&#10;..."
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 outline-none bg-gray-50 focus:bg-white font-mono text-sm"
                    value={form.specs}
                    onChange={(e) => setForm({ ...form, specs: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN - SIDEBAR INFO */}
        <div className="space-y-6">
          {/* PRICING CARD */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
              <FaTag className="text-indigo-500" /> Pricing & Stock
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Selling Price</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <FaRupeeSign size={12} />
                    </div>
                    <input
                      type="number"
                      className="w-full border border-gray-300 rounded-lg pl-8 p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">MRP</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <FaRupeeSign size={12} />
                    </div>
                    <input
                      type="number"
                      className="w-full border border-gray-300 rounded-lg pl-8 p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={form.mrp}
                      onChange={(e) => setForm({ ...form, mrp: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Stock Qty</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <FaWarehouse size={12} />
                    </div>
                    <input
                      type="number"
                      className="w-full border border-gray-300 rounded-lg pl-8 p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={form.stock}
                      onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Rating</label>
                  <input
                    type="number"
                    step="0.1"
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={form.rating}
                    onChange={(e) => setForm({ ...form, rating: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* MEDIA CARD */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
              <FaImage className="text-indigo-500" /> Media
            </h2>
            <div className="space-y-3">
              <label className="text-sm text-gray-500">Image URLs (Google Drive / CDNs)</label>
              {form.images.map((img, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    placeholder={`Image URL ${i + 1}`}
                    className="flex-1 border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={img}
                    onChange={(e) => {
                      const updated = [...form.images];
                      updated[i] = e.target.value;
                      setForm({ ...form, images: updated });
                    }}
                  />
                  {form.images.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        const updated = form.images.filter((_, idx) => idx !== i);
                        setForm({ ...form, images: updated });
                      }}
                      className="text-red-500 hover:bg-red-50 p-2 rounded-lg"
                    >
                      <FaTrash size={14} />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => setForm({ ...form, images: [...form.images, ""] })}
                className="text-indigo-600 text-sm font-bold hover:underline flex items-center gap-1"
              >
                <FaPlus size={12} /> Add More Images
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 bg-gray-100 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-200 transition flex items-center justify-center gap-2"
              >
                Cancel
              </button>
            )}
            <button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-200 transition-transform active:scale-95 flex items-center justify-center gap-2">
              <FaSave /> {editingId ? "Update Product" : "Save Product"}
            </button>
          </div>
        </div>
      </form>

      {/* PRODUCT LIST */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <FaWarehouse className="text-gray-400" /> Current Inventory
          </h2>
          <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{products.length} Items</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-100">
              <tr>
                <th className="p-4">Product</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-gray-900">{p.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-gray-300"></span>
                      {p.category}
                    </div>
                  </td>
                  <td className="p-4 font-medium">
                    <div className="text-gray-900">₹{p.price}</div>
                    {p.mrp && <div className="text-xs text-gray-400 line-through">₹{p.mrp}</div>}
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${p.stock < 5 ? 'bg-red-50 text-red-700 border-red-100' : 'bg-green-50 text-green-700 border-green-100'}`}>
                      {p.stock} Units
                    </span>
                  </td>
                  <td className="p-4">
                    {p.stock > 0 ? (
                      <span className="flex items-center gap-1.5 text-green-600 font-bold text-xs uppercase">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-red-500 font-bold text-xs uppercase">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Out of Stock
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(p)}
                        className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 p-2 rounded-lg transition"
                        title="Edit"
                      >
                        <FaEdit size={16} />
                      </button>
                      <button
                        onClick={() => deleteProduct(p.id)}
                        className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition"
                        title="Delete"
                      >
                        <FaTrash size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
      />
    </div>
  );
};

export default ProductManager;
