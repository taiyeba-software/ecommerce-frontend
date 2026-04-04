import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useProducts } from "../context/useProducts";
import { normalizeId } from "../lib/utils";
import toast from "react-hot-toast";
import ProfileSidebar from "../components/ProfileSidebar";

const CartPage = () => {
  const { user } = useAuth();
  const { removeItemFromCart, clearCart, updateCartItemQuantity, fetchCart } = useProducts();
  const [localCart, setLocalCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [removingItems, setRemovingItems] = useState(new Set());
  const [updatingQuantities, setUpdatingQuantities] = useState(new Set());
  const [isProfileSidebarOpen, setIsProfileSidebarOpen] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [discount, setDiscount] = useState("");
  const [applyingDiscount, setApplyingDiscount] = useState(false);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    handleFetchCart();
  }, [user]);

  const handleFetchCart = async () => {
    setLoading(true);
    const data = await fetchCart();
    if (data) {
      setLocalCart(data);
    }
    setLoading(false);
  };

  const handleRemoveItem = async (productId) => {
    setRemovingItems(prev => new Set(prev).add(productId));
    try {
      await removeItemFromCart(productId, user);
      await handleFetchCart(); // Refresh cart data
    } catch {
      // Error already handled in removeItemFromCart
    } finally {
      setRemovingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCart(user);
      await handleFetchCart(); // Refresh cart data
    } catch {
      // Error already handled in clearCart
    }
  };

  const handleUpdateQuantity = async (productId, newQty) => {
    setUpdatingQuantities(prev => new Set(prev).add(productId));
    try {
      await updateCartItemQuantity(productId, newQty, user);
      await handleFetchCart(); // Refresh cart data
    } catch {
      // Error already handled in updateCartItemQuantity
    } finally {
      setUpdatingQuantities(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    try {
      await api.post("/orders", { paymentMethod: "COD" });

      // ✅ 1. Show success popup
      toast.success("Order placed successfully!");

      // ✅ 2. Clear cart visually
      setLocalCart({ items: [] });

    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to place order"
      );
    } finally {
      setIsCheckingOut(false);
    }
  };

  // 🔴 Apply discount code and refetch cart
  const handleApplyDiscount = async () => {
    if (!discount.trim()) {
      toast.error("Please enter a discount code or value");
      return;
    }

    setApplyingDiscount(true);
    try {
      const data = await fetchCart(discount);
      if (data) {
        setLocalCart(data);
      }
      toast.success("Discount applied!");
      setDiscount(""); // Clear input
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to apply discount"
      );
    } finally {
      setApplyingDiscount(false);
    }
  };

  if (!user) {
    return <p className="p-4 text-center text-red-500">Please log in to view your cart.</p>;
  }
  if (loading) {
    return <p className="p-4 text-center">Loading cart...</p>;
  }
  if (!localCart || localCart.items.length === 0) {
    return <p className="p-4 text-center">Your cart is empty.</p>;
  }

  // Destructure totals from cart data
  const { items, subtotal, deliveryCharge, discountPercent, discountAmount, totalPayable, warnings } = localCart;

  const colorPalette = [];

  return (
    <>
      <div className="min-h-screen bg-background text-black p-6 mx-10%">
          <h1 className="text-3xl font-bold mb-6">Your Cart</h1>

          {/* 🔴 Warnings UI */}
          {warnings && warnings.length > 0 && (
            <div className="mb-6 p-4 border-l-4 border-yellow-400 bg-yellow-50 rounded">
              <div className="flex gap-3">
                <span className="text-lg">⚠️</span>
                <div>
                  <p className="font-semibold text-yellow-900 mb-2">Cart Issues</p>
                  <ul className="text-sm text-yellow-800 space-y-1">
                    {warnings.map((warning, idx) => (
                      <li key={idx}>• {warning}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* List of items */}
          <div className="space-y-4">
            {items.map(({ product, qty, lineTotal }, index) => {
              const bgColor = colorPalette[index % colorPalette.length];
              return (
                <div
                  key={normalizeId(product._id)}
                  className="flex flex-col md:flex-row md:items-center justify-between border rounded-lg p-4"
                  style={{ backgroundColor: bgColor }}
                >
                  <div className="flex items-center gap-4">
                    {product.images && product.images[0] && (
                      <img
                        src={product.images[0].url}
                        alt={product.name}
                        className="w-24 h-24 object-cover rounded"
                      />
                    )}
                    <div>
                      <h2 className="text-xl font-semibold">{product.name}</h2>
                      <p>Price: ৳{product.price}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <button
                          onClick={() => handleUpdateQuantity(normalizeId(product._id), qty - 1)}
                          disabled={updatingQuantities.has(normalizeId(product._id)) || qty <= 1}
                          className="px-2 py-1 bg-gray-300 text-black rounded hover:bg-gray-400 disabled:opacity-50 text-sm"
                        >
                          -
                        </button>
                        <span className="px-2">{qty}</span>
                        <button
                          onClick={() => handleUpdateQuantity(normalizeId(product._id), qty + 1)}
                          disabled={updatingQuantities.has(normalizeId(product._id))}
                          className="px-2 py-1 bg-gray-300 text-black rounded hover:bg-gray-400 disabled:opacity-50 text-sm"
                        >
                          +
                        </button>
                        {updatingQuantities.has(normalizeId(product._id)) && <span className="text-sm text-gray-500">Updating...</span>}
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-2">
                    <p className="font-bold">Item Total: ৳{lineTotal}</p>
                    <button
                      onClick={() => handleRemoveItem(normalizeId(product._id))}
                      disabled={removingItems.has(normalizeId(product._id))}
                      className="px-3 py-1 text-white rounded disabled:opacity-50 text-sm"
                      style={{ backgroundColor: 'crimson' }}
                    >
                      {removingItems.has(normalizeId(product._id)) ? "Removing..." : "Remove"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Totals summary */}
          <div className="mt-6 p-4 border rounded-lg bg-background/80 max-w-full ml-auto">
            <p>Subtotal: ৳{subtotal}</p>
            <p>Delivery Charge: ৳{deliveryCharge}</p>
            <p>Discount: {discountPercent}% (৳{discountAmount})</p>

            {/* 🔴 DISCOUNT CODE INPUT */}
            <div className="mt-4 pt-4 border-t">
              <label className="block text-sm font-semibold mb-2 text-gray-800">Apply Discount (Optional)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  placeholder="Enter discount code or %"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded text-black bg-white"
                  disabled={applyingDiscount}
                />
                <button
                  onClick={handleApplyDiscount}
                  disabled={applyingDiscount || !discount.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm whitespace-nowrap"
                >
                  {applyingDiscount ? "Applying..." : "Apply"}
                </button>
              </div>
            </div>

            <hr className="my-2"/>
            <p className="text-lg font-bold text-gray-900">Total: ৳{totalPayable}</p>
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleClearCart}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
              >
                Clear Cart
              </button>
            </div>
          </div>

          {/* Checkout button */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={handleCheckout}
              disabled={isCheckingOut}
              className="cosmic-button disabled:opacity-50"
            >
              {isCheckingOut ? "Processing..." : "Checkout (Cash on Delivery)"}
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

export default CartPage;
