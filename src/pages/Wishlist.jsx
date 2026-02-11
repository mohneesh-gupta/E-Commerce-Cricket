import React from "react";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import { Link } from "react-router-dom";
import { getDirectImageUrl } from "../utils/imageUtils";

const Wishlist = () => {
    const { wishlist, removeFromWishlist, loading } = useWishlist();
    const { addToCart } = useCart();

    const handleMoveToCart = async (product) => {
        await addToCart({
            id: product.productId,
            name: product.name,
            price: product.price,
            image: product.image
        });
        await removeFromWishlist(product.productId);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (wishlist.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <div className="w-24 h-24 bg-red-50 text-red-400 rounded-full flex items-center justify-center mb-6 text-4xl">
                    ❤️
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Wishlist is Empty</h2>
                <p className="text-gray-500 mb-8 max-w-sm">
                    Looks like you haven't added anything to your wishlist yet. Explore our products and find something you love!
                </p>
                <Link
                    to="/products"
                    className="bg-black text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 transition shadow-lg hover:-translate-y-1"
                >
                    Explore Products
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-12 min-h-[calc(100vh-5rem)]">
            <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                ❤️ My Wishlist <span className="text-lg font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{wishlist.length} Items</span>
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {wishlist.map((item) => (
                    <div key={item.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex gap-4 hover:shadow-md transition">
                        <Link to={`/product/${item.productId}`} className="w-24 h-24 shrink-0 bg-gray-50 rounded-xl overflow-hidden">
                            <img
                                src={getDirectImageUrl(item.image) || "https://placehold.co/100"}
                                alt={item.name}
                                className="w-full h-full object-cover"
                            />
                        </Link>

                        <div className="flex-1 flex flex-col justify-between">
                            <div>
                                <Link to={`/product/${item.productId}`} className="font-bold text-gray-900 line-clamp-1 hover:text-blue-600 transition">
                                    {item.name}
                                </Link>
                                <p className="text-blue-600 font-bold mt-1">₹{Number(item.price).toLocaleString()}</p>
                            </div>

                            <div className="flex gap-2 mt-3">
                                <button
                                    onClick={() => handleMoveToCart(item)}
                                    className="flex-1 bg-black text-white text-xs font-bold py-2 rounded-lg hover:bg-gray-800 transition"
                                >
                                    Move to Cart
                                </button>
                                <button
                                    onClick={() => removeFromWishlist(item.productId)}
                                    className="px-3 py-2 border border-gray-200 text-gray-400 rounded-lg hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition"
                                    title="Remove"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Wishlist;
