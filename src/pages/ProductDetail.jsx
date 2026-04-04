import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useProducts } from "../context/useProducts";
import { useAuth } from "../context/AuthContext";
import ProfileSidebar from "../components/ProfileSidebar";
import { normalizeId } from "../lib/utils";

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart, fetchProductById } = useProducts();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isProfileSidebarOpen, setIsProfileSidebarOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    const getProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const pid = normalizeId(id);
        const data = await fetchProductById(pid);
        if (mounted) setProduct(data);
      } catch (err) {
        console.error(err);
        if (mounted) setError("Product not found.");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    getProduct();
    return () => { mounted = false; };
  }, [id, fetchProductById]);

  const handleAddToCart = () => {
    addToCart(product, user); // Supports both guest and logged-in users
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;
  if (!product) return <p className="text-center mt-10">Product not found.</p>;

  return (
    <>
      <div className="max-w-5xl mx-40% p-6 flex flex-col md:flex-row gap-6">
          <div className="md:w-1/2">
            <img
              src={product.images?.[0]?.url || product.image}
              alt={product.name}
              className="w-full h-auto rounded-md object-cover shadow"
            />
          </div>
          <div className="md:w-1/2 flex flex-col bg-background/80 p-6 rounded-lg shadow-lg animate-fade-in">
            <h1 className="text-3xl font-bold mb-4 text-foreground" style={{ fontFamily: "MPLUS-Rounded" }}>{product.name}</h1>
            <p className="text-gray-600 mb-4" style={{ fontFamily: "EduCursive" }}>{product.description} .It's very gentle for your skin and makes your skin glow like a diamond. best for banglashi weather . There are more natural skin care products available now than ever, and their long list of benefits extends beyond even great-looking skin. When you use natural products like this regularly, not only do you beautify your skin, but you also absorb antioxidants, enhance your skin’s UV resistance and stimulate your immune system, too.</p>
            <p className="text-primary font-bold text-2xl mb-6" style={{ fontFamily: "MPLUS-Rounded" }}>৳{product.price}</p>
            <button
              className="cosmic-button animate-glow"
              onClick={handleAddToCart}
            >
              Add to Cart
            </button>
          </div>
        </div>

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

export default ProductDetail;
