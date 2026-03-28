import React, { useEffect, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ProductContext } from "../context/ProductContext";
import ProductCard from "../components/ProductCard";
import { normalizeId } from "../lib/utils";
import ProfileSidebar from "../components/ProfileSidebar";
import { useAuth } from "../context/AuthContext";


const ProductListing = () => {
  const navigate = useNavigate();
  const { products, fetchProducts, loading, error } = useContext(ProductContext);
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [isProfileSidebarOpen, setIsProfileSidebarOpen] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <div className="text-center py-10">Loading products...</div>;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;

  const filteredProducts = products.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q)
    );
  });

  return (
    <>
      <section className="relative w-full min-h-screen px-1 ">

          <div className="absolute top-2 right-2 md:top-4 md:right-4">
            <button
              onClick={() => navigate('/')}
              className="cosmic-button text-xs md:text-sm mr-2"
            >
              Back to Home
            </button>
          </div>
          <div className="min-h-screen bg-background text-foreground p-6 mx-8">

          <h1 className="text-3xl font-bold mb-6" style={{ fontFamily: 'EduNSWACTCursive-SemiBold, cursive' }}>Products</h1>

          {/* Search Bar */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full max-w-md px-5 py-3 rounded-full border-2 border-gray-300 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
              autoFocus
            />
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={normalizeId(product._id)} product={product} />
              ))}
          </div>
        </div>
      </section>

      {/* Profile Sidebar */}
      {user && (
        <ProfileSidebar
          isOpen={isProfileSidebarOpen}
          onClose={() => setIsProfileSidebarOpen(false)}
        />
      )}
    </>
  );
};

export default ProductListing;
