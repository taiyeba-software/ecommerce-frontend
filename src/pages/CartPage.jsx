import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useProducts } from "../context/useProducts";
import { ModalContext } from "../context/ModalContext";
import { normalizeId } from "../lib/utils";
import toast from "react-hot-toast";
import ProfileSidebar from "../components/ProfileSidebar";

const CartPage = () => {
  const navigate = useNavigate();
  const { openModal } = useContext(ModalContext);
  const { user } = useAuth();
  const { removeItemFromCart, clearCart, updateCartItemQuantity, fetchCart, fetchProductById } = useProducts();
  const [localCart, setLocalCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [removingItems, setRemovingItems] = useState(new Set());
  const [updatingQuantities, setUpdatingQuantities] = useState(new Set());
  const [isProfileSidebarOpen, setIsProfileSidebarOpen] = useState(false);
  const [discount, setDiscount] = useState("");
  const [applyingDiscount, setApplyingDiscount] = useState(false);

  const buildGuestCartView = async () => {
    try {
      const parsed = JSON.parse(localStorage.getItem("guestCart") || '{"items":[]}');
      const guestItems = Array.isArray(parsed?.items) ? parsed.items : [];

      if (guestItems.length === 0) {
        setLocalCart({
          items: [],
          subtotal: 0,
          deliveryCharge: 0,
          discountPercent: 0,
          discountAmount: 0,
          totalPayable: 0,
          warnings: [],
        });
        return;
      }

      const warnings = [];
      const hydrated = await Promise.all(
        guestItems.map(async (item) => {
          try {
            const product = await fetchProductById(item.productId);
            const price = Number(product?.price) || 0;
            const qty = Math.max(1, Number(item?.qty) || 1);
            const lineTotal = Math.round(price * qty * 100) / 100;

            return {
              product: {
                _id: normalizeId(product?._id || item.productId),
                name: product?.name || "Product",
                price,
                images: product?.images || [],
              },
              qty,
              lineTotal,
            };
          } catch {
            warnings.push(`Product ${item.productId} not found, skipped`);
            return null;
          }
        })
      );

      const items = hydrated.filter(Boolean);
      const subtotal = Math.round(items.reduce((sum, it) => sum + it.lineTotal, 0) * 100) / 100;
      const deliveryCharge = subtotal >= 1000 || subtotal === 0 ? 0 : 50;
      const discountPercent = 0;
      const discountAmount = 0;
      const totalPayable = Math.round((subtotal + deliveryCharge) * 100) / 100;

      setLocalCart({
        items,
        subtotal,
        deliveryCharge,
        discountPercent,
        discountAmount,
        totalPayable,
        warnings,
      });
    } catch (error) {
      console.error("buildGuestCartView error:", error);
      setLocalCart({
        items: [],
        subtotal: 0,
        deliveryCharge: 0,
        discountPercent: 0,
        discountAmount: 0,
        totalPayable: 0,
        warnings: ["Could not read guest cart"],
      });
    }
  };

  useEffect(() => {
    if (!user) {
      buildGuestCartView();
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
      if (user) {
        await removeItemFromCart(productId, user);
        await handleFetchCart(); // Refresh cart data
      } else {
        const parsed = JSON.parse(localStorage.getItem("guestCart") || '{"items":[]}');
        const items = Array.isArray(parsed?.items) ? parsed.items : [];
        const nextItems = items.filter((it) => normalizeId(it.productId) !== normalizeId(productId));
        localStorage.setItem("guestCart", JSON.stringify({ items: nextItems }));
        await buildGuestCartView();
        toast.success("Item removed from guest cart!");
      }
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
      if (user) {
        await clearCart(user);
        await handleFetchCart(); // Refresh cart data
      } else {
        if (!window.confirm("Are you sure you want to clear your entire cart?")) {
          return;
        }
        localStorage.removeItem("guestCart");
        await buildGuestCartView();
        toast.success("Guest cart cleared successfully!");
      }
    } catch {
      // Error already handled in clearCart
    }
  };

  const handleUpdateQuantity = async (productId, newQty) => {
    setUpdatingQuantities(prev => new Set(prev).add(productId));
    try {
      if (user) {
        await updateCartItemQuantity(productId, newQty, user);
        await handleFetchCart(); // Refresh cart data
      } else {
        if (newQty < 1) {
          return;
        }
        const parsed = JSON.parse(localStorage.getItem("guestCart") || '{"items":[]}');
        const items = Array.isArray(parsed?.items) ? parsed.items : [];
        const nextItems = items.map((it) =>
          normalizeId(it.productId) === normalizeId(productId)
            ? { ...it, qty: newQty }
            : it
        );
        localStorage.setItem("guestCart", JSON.stringify({ items: nextItems }));
        await buildGuestCartView();
      }
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

  const handleCheckout = () => {
    if (!user) {
      toast.error("Please login to checkout");
      openModal("login");
      return;
    }

    navigate("/checkout");
  };

  // 🔴 Apply discount code and refetch cart
  const handleApplyDiscount = async () => {
    if (!user) {
      toast.error("Discount is applied from backend after login.");
      return;
    }

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
              className="cosmic-button"
            >
              Proceed to Checkout
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
