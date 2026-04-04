import React, { useState } from "react";
import toast from "react-hot-toast";
import { ProductContext } from "./ProductContext";
import { normalizeId } from "../lib/utils";
import { isAdminOrSeller } from "../utils/role";
import api from "@/api/axiosInstance";

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 🟢 Fetch all products
  const fetchProducts = async (query = {}) => {
    setLoading(true);
    setError(null);
    try {
      console.log("🔥 fetchProducts CALLED");
      console.log("🌍 API URL:", import.meta.env.VITE_API_URL);
      const { data } = await api.get("/products", { params: query.q ? { q: query.q } : {} });
      setProducts(data.products || []);
    } catch (err) {
      console.error("fetchProducts error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 🟢 Fetch single product by ID
  const fetchProductById = async (id) => {
    try {
      const { data } = await api.get(`/products/${id}`);
      return data.product || data;
    } catch (err) {
      console.error("fetchProductById error:", err);
      throw err;
    }
  };

  // 🟢 Add to Cart
  const addToCart = async (product, user) => {
    const productId = normalizeId(product._id || product);
    const productName = typeof product === 'object' ? product.name : 'Item';

    if (user) {
      // 🟢 AUTHENTICATED: Call API
      try {
        const { data } = await api.post("/cart/items", { 
          productId, 
          qty: 1 
        });
        toast.success(`${productName} added to cart!`);
        return data;
      } catch (err) {
        console.error("addToCart error:", err);
        toast.error(err.response?.data?.message || "Network error, please try again.");
      }
    } else {
      // 🟢 GUEST: Store in localStorage
      try {
        const guestCartData = localStorage.getItem("guestCart") || JSON.stringify({ items: [] });
        const guestCart = JSON.parse(guestCartData);
        
        const existingItem = guestCart.items.find(
          item => normalizeId(item.productId) === productId
        );
        
        if (existingItem) {
          existingItem.qty += 1;
        } else {
          guestCart.items.push({ productId, qty: 1 });
        }
        
        localStorage.setItem("guestCart", JSON.stringify(guestCart));
        toast.success(`${productName} added to cart!`);
      } catch (err) {
        console.error("addToGuestCart error:", err);
        toast.error("Failed to add to cart");
      }
    }
  };

  // 🟢 Add new product (Admin)
  const addProduct = async (formData, user) => {
    if (!isAdminOrSeller(user)) return toast.error("Not authorized!");
    try {
      const { data } = await api.post("/products", formData);
      setProducts((prev) => [data.product, ...prev]);
      toast.success("Product added successfully!");
      return data;
    } catch (err) {
      console.error(err.message);
      toast.error(err.response?.data?.message || err.message);
      return null;
    }
  };

  // 🟢 Edit product (Admin)
  const editProduct = async (id, updatedProduct, user) => {
    if (!isAdminOrSeller(user)) return toast.error("Not authorized!");
    try {
      const { data } = await api.patch(`/products/${normalizeId(id)}`, updatedProduct);
      setProducts((prev) =>
        prev.map((p) => (normalizeId(p._id) === normalizeId(id) ? data.product || data : p))
      );
      toast.success("Product updated successfully!");
    } catch (err) {
      console.error("editProduct error:", err);
      toast.error(err.response?.data?.message || err.message);
    }
  };

  // 🟢 Delete product (Admin)
  const deleteProduct = async (id, user) => {
    if (!isAdminOrSeller(user)) return toast.error("Not authorized!");
    try {
      await api.delete(`/products/${normalizeId(id)}`);
      setProducts((prev) => prev.filter((p) => normalizeId(p._id) !== normalizeId(id)));
      toast.success("Product deleted successfully!");
    } catch (err) {
      console.error("deleteProduct error:", err);
      toast.error(err.response?.data?.message || err.message);
    }
  };

  // 🟢 Remove item from cart
  const removeItemFromCart = async (productId, user) => {
    if (!user) {
      toast.error("You must be logged in to remove items from cart!");
      return;
    }

    try {
      await api.delete(`/cart/items/${productId}`);
      toast.success("Item removed from cart!");
    } catch (err) {
      console.error("removeItemFromCart error:", err);
      toast.error(err.response?.data?.message || "Network error, please try again.");
    }
  };

  // 🟢 Clear entire cart
  const clearCart = async (user, skipConfirm = false) => {
    if (!user) {
      toast.error("You must be logged in to clear cart!");
      return;
    }

    if (!skipConfirm && !window.confirm("Are you sure you want to clear your entire cart?")) {
      return;
    }

    try {
      await api.delete("/cart");
      toast.success("Cart cleared successfully!");
      setCart(null);
    } catch (err) {
      console.error("clearCart error:", err);
      toast.error(err.response?.data?.message || "Network error, please try again.");
    }
  };

  // 🟢 Update cart item quantity
  const updateCartItemQuantity = async (productId, newQty, user) => {
    if (!user) {
      toast.error("You must be logged in to update cart!");
      return;
    }

    if (newQty < 1) {
      toast.error("Quantity must be at least 1");
      return;
    }

    try {
      await api.patch(`/cart/items/${productId}`, { qty: newQty });
      toast.success("Quantity updated!");
    } catch (err) {
      console.error("updateCartItemQuantity error:", err);
      toast.error(err.response?.data?.message || "Network error, please try again.");
    }
  };

  // 🟢 Fetch cart (global - can be used anywhere)
  const fetchCart = async (discountParam = "") => {
    try {
      const url = discountParam ? `/cart?discount=${encodeURIComponent(discountParam)}` : "/cart";
      const { data } = await api.get(url);
      setCart(data);
      return data;
    } catch (error) {
      console.error("fetchCart error:", error);
      toast.error("Failed to load cart");
      return null;
    }
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        cart,
        loading,
        error,
        fetchProducts,
        fetchProductById,
        fetchCart,
        addToCart,
        addProduct,
        editProduct,
        deleteProduct,
        removeItemFromCart,
        clearCart,
        updateCartItemQuantity,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};
