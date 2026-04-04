import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "@/api/axiosInstance";
import { useAuth } from "@/context/AuthContext";

const CheckoutPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const formatPrice = (amount) =>
    new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
    }).format(Number(amount) || 0);

  const [cart, setCart] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  // Step 1: PROTECT PAGE
  useEffect(() => {
    if (!user) {
      toast.error("Please login to continue");
      navigate("/");
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch cart from backend
        const cartRes = await api.get("/cart");
        setCart(cartRes.data);

        // Fetch profile
        const profileRes = await api.get("/auth/profile");
        const userData = profileRes.data.user || profileRes.data;
        
        setProfile(userData);
        setForm({
          name: userData.name || "",
          email: userData.email || "",
          phone: userData.phone || "",
          address: userData.address?.line1 || "",
        });
      } catch (err) {
        console.error("Failed to load checkout data:", err);
        toast.error("Failed to load checkout data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, navigate]);

  // Handle form changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Place order
  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      const response = await api.post("/orders", {
        paymentMethod: "COD",
      });

      toast.success("Order placed successfully!");
      navigate("/success", { state: { orderId: response.data._id } });
    } catch (err) {
      console.error("Order placement error:", err);
      toast.error(err.response?.data?.message || "Failed to place order");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "hsl(var(--background))" }}>
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-gray-300 border-t-pink-500 rounded-full animate-spin mb-4"></div>
          <p style={{ color: "hsl(var(--foreground))" }} className="text-lg font-medium">Loading checkout...</p>
        </div>
      </div>
    );
  }

  // Check if cart is empty
  if (!cart || cart.items?.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "hsl(var(--background))" }}>
        <div className="text-center">
          <p style={{ color: "hsl(var(--foreground))" }} className="text-2xl font-bold mb-4">Your cart is empty</p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 rounded-full font-semibold text-white transition-all hover:scale-105"
            style={{ backgroundColor: "hsl(var(--accent))" }}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  const subtotal = Number(cart?.subtotal || 0);
  const delivery = Number(cart?.deliveryCharge || 0);
  const discount = Number(cart?.discountAmount || 0);
  const total = Number(cart?.totalPayable || 0);

  return (
    <div className="min-h-screen py-12 px-4" style={{ backgroundColor: "hsl(var(--background))" }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-2" style={{ color: "hsl(var(--foreground))" }}>
            Checkout
          </h1>
          <p style={{ color: "hsl(var(--muted-foreground))" }} className="text-lg">Complete your order in 2 simple steps</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Side: Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handlePlaceOrder} className="space-y-8">
              {/* Shipping Address Section */}
              <div className="rounded-2xl p-8 border-2" style={{
                backgroundColor: "hsl(var(--card))",
                borderColor: "hsl(var(--border))"
              }}>
                <div className="flex items-center gap-3 mb-6">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-white" style={{ backgroundColor: "hsl(var(--accent))" }}>
                    1
                  </span>
                  <h2 className="text-2xl font-bold" style={{ color: "hsl(var(--foreground))" }}>
                    Shipping Address
                  </h2>
                </div>

                <div className="space-y-5">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: "hsl(var(--foreground))" }}>Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleInputChange}
                      placeholder="John Doe"
                      className="w-full px-4 py-3 rounded-xl border-2 transition-all focus:outline-none"
                      style={{
                        borderColor: "hsl(var(--border))",
                        backgroundColor: "hsl(var(--card2))"
                      }}
                      required
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: "hsl(var(--foreground))" }}>Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleInputChange}
                      placeholder="you@example.com"
                      className="w-full px-4 py-3 rounded-xl border-2 transition-all focus:outline-none"
                      style={{
                        borderColor: "hsl(var(--border))",
                        backgroundColor: "hsl(var(--card2))"
                      }}
                      required
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: "hsl(var(--foreground))" }}>Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleInputChange}
                      placeholder="+1 (555) 000-0000"
                      className="w-full px-4 py-3 rounded-xl border-2 transition-all focus:outline-none"
                      style={{
                        borderColor: "hsl(var(--border))",
                        backgroundColor: "hsl(var(--card2))"
                      }}
                      required
                    />
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: "hsl(var(--foreground))" }}>Address</label>
                    <textarea
                      name="address"
                      value={form.address}
                      onChange={handleInputChange}
                      placeholder="123 Main Street, Apt 4B..."
                      rows="3"
                      className="w-full px-4 py-3 rounded-xl border-2 transition-all focus:outline-none resize-none"
                      style={{
                        borderColor: "hsl(var(--border))",
                        backgroundColor: "hsl(var(--card2))"
                      }}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Order Review Section */}
              <div className="rounded-2xl p-8 border-2" style={{
                backgroundColor: "hsl(var(--card))",
                borderColor: "hsl(var(--border))"
              }}>
                <div className="flex items-center gap-3 mb-6">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-white" style={{ backgroundColor: "hsl(var(--accent))" }}>
                    2
                  </span>
                  <h2 className="text-2xl font-bold" style={{ color: "hsl(var(--foreground))" }}>
                    Order Review
                  </h2>
                </div>

                <div className="space-y-3 mb-6">
                  {cart.items?.map((item, idx) => (
                    <div key={item.product?._id || idx} className="flex justify-between items-center py-3 border-b" style={{ borderColor: "hsl(var(--border))" }}>
                      <div>
                        <p className="font-semibold" style={{ color: "hsl(var(--foreground))" }}>{item.product?.name}</p>
                        <p style={{ color: "hsl(var(--muted-foreground))" }} className="text-sm">Qty: {item.qty}</p>
                      </div>
                      <p className="font-bold" style={{ color: "hsl(var(--accent))" }}>₹{Number(item.lineTotal || 0).toFixed(2)}</p>
                    </div>
                  ))}
                </div>

                <div className="text-sm space-y-2 pt-4 border-t" style={{ borderColor: "hsl(var(--border))" }}>
                  <div className="flex justify-between">
                    <span style={{ color: "hsl(var(--muted-foreground))" }}>Subtotal:</span>
                    <span style={{ color: "hsl(var(--foreground))" }} className="font-semibold">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: "hsl(var(--muted-foreground))" }}>Delivery:</span>
                    <span style={{ color: "hsl(var(--foreground))" }} className="font-semibold">{formatPrice(delivery)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: "hsl(var(--muted-foreground))" }}>Discount:</span>
                    <span style={{ color: "hsl(var(--foreground))" }} className="font-semibold">-{formatPrice(discount)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t" style={{ borderColor: "hsl(var(--border))" }}>
                    <span style={{ color: "hsl(var(--foreground))" }}>Total:</span>
                    <span style={{ color: "hsl(var(--accent))" }}>{formatPrice(total)}</span>
                  </div>
                </div>
              </div>

              {/* Place Order Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 rounded-full font-extrabold text-white text-lg tracking-wide uppercase transition-all hover:scale-105 active:scale-95 disabled:opacity-70 border border-white/20 shadow-[0_12px_30px_rgba(204,51,102,0.35)] hover:shadow-[0_16px_40px_rgba(204,51,102,0.45)]"
                style={{
                  background: "linear-gradient(135deg, hsl(var(--accent)) 0%, hsl(340, 70%, 45%) 100%)",
                }}
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Processing...
                  </span>
                ) : (
                  "Place Order"
                )}
              </button>
            </form>
          </div>

          {/* Right Side: Order Summary (Sticky) */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl p-6 border-2 sticky top-24" style={{
              backgroundColor: "hsl(var(--card))",
              borderColor: "hsl(var(--border))"
            }}>
              <h3 className="text-2xl font-bold mb-6" style={{ color: "hsl(var(--foreground))" }}>
                Order Summary
              </h3>

              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                {cart.items?.map((item, idx) => (
                  <div key={item.product?._id || idx} className="flex justify-between items-start text-sm">
                    <div>
                      <p className="font-semibold" style={{ color: "hsl(var(--foreground))" }}>
                        {item.product?.name}
                      </p>
                      <p style={{ color: "hsl(var(--muted-foreground))" }}>x{item.qty}</p>
                    </div>
                    <p className="font-bold" style={{ color: "hsl(var(--accent))" }}>
                      {formatPrice(item.lineTotal)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="space-y-3 py-4 border-t border-b" style={{ borderColor: "hsl(var(--border))" }}>
                <div className="flex justify-between text-sm">
                  <span style={{ color: "hsl(var(--muted-foreground))" }}>Subtotal</span>
                  <span style={{ color: "hsl(var(--foreground))" }} className="font-semibold">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: "hsl(var(--muted-foreground))" }}>Delivery</span>
                  <span style={{ color: "hsl(var(--foreground))" }} className="font-semibold">{formatPrice(delivery)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: "hsl(var(--muted-foreground))" }}>Discount</span>
                  <span style={{ color: "hsl(var(--foreground))" }} className="font-semibold">-{formatPrice(discount)}</span>
                </div>
              </div>

              <div className="flex justify-between items-center mt-4 pt-4">
                <span style={{ color: "hsl(var(--foreground))" }} className="text-lg font-bold">Total:</span>
                <span style={{ color: "hsl(var(--accent))" }} className="text-2xl font-bold">
                  {formatPrice(total)}
                </span>
              </div>

              <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: "hsl(var(--card2))" }}>
                <p style={{ color: "hsl(var(--muted-foreground))" }} className="text-xs text-center">
                  ✓ Secure Checkout
                </p>
                <p style={{ color: "hsl(var(--muted-foreground))" }} className="text-xs text-center mt-1">
                  Cash on Delivery Available
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
