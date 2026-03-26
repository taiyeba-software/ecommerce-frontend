import React from "react";
import { useProducts } from "../context/useProducts";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { normalizeId } from "../lib/utils";
import { isAdminOrSeller } from "../utils/role";

const ProductCard = ({ product }) => {
  const { user } = useAuth();
  const { deleteProduct, addToCart } = useProducts();

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      deleteProduct(normalizeId(product._id || product), user);
    }
  };

  const handleAddToCart = () => {
    addToCart(product, user);
  };

  return (
    <div className="border rounded-lg shadow-md p-4 relative hover:shadow-xl transition-all duration-300 bg-background/80 text-background">
    
   
      <Link to={`/products/${normalizeId(product._id || product)}`}>
        <img
          src={product.images?.[0]?.url || "/placeholder.png"}
          alt={product.name}
          className="w-full h-48 object-cover rounded responsive-image"
        />
        <h2 className="text-xl font-semibold mt-3 text-foreground" style={{ fontFamily: "MPLUS-Rounded" }}>{product.name}</h2>
        <p className="text-gray-600 mt-1" style={{ fontFamily: "EduCursive" }}>{product.description}. </p>
        <p className="text-primary font-bold mt-2" style={{ fontFamily: "MPLUS-Rounded" }}>৳{product.price}</p>
      </Link>

      <div className="mt-4 flex justify-center">
        <button
          onClick={handleAddToCart}
          className="cosmic-button"
        >
          Add to Cart
        </button>
      </div>

      {isAdminOrSeller(user) && (
        <button
          onClick={handleDelete}
          className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md transition"
        >
          Delete
        </button>
      )}
    </div>
  );
};

export default ProductCard;
