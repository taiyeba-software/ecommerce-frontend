import React, { useContext, useEffect, useState, useRef } from "react";
import { AuthContext } from "../../context/AuthContext";
import { ModalContext } from "../../context/ModalContext";
import { X } from "lucide-react";

/**
 * AuthModal
 * - Single global modal that shows login OR register based on modalType from ModalContext
 */
export default function AuthModal() {
  const { modalType, closeModal, openModal } = useContext(ModalContext);
  const { login, register } = useContext(AuthContext);

  // Local form state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const dialogRef = useRef(null);

  // Reset form whenever modal type changes (open/register or open/login)
  useEffect(() => {
    setForm({ name: "", email: "", password: "" });
    setError("");
    setIsSubmitting(false);
  }, [modalType]);

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") closeModal();
    };
    if (modalType) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modalType, closeModal]);

  // If modalType is null -> don't render
  if (!modalType) return null;

  // Basic client-side validation helpers
  const isValidEmail = (value) =>
    !!value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  const isValidPassword = (value) => !!value && value.length >= 6;
  const isValidName = (value) => !!value && value.trim().length >= 2;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const handleOverlayClick = (e) => {
    // close only when clicked on backdrop, not inside dialog
    if (e.target === e.currentTarget) closeModal();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!isValidEmail(form.email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!isValidPassword(form.password)) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (modalType === "register" && !isValidName(form.name)) {
      setError("Please enter your full name (at least 2 characters).");
      return;
    }

    setIsSubmitting(true);

    try {
      if (modalType === "login") {
        // login(email, password) is implemented in AuthContext
        await login(form.email.trim(), form.password);
      } else {
        // register(name, email, password)
        await register(form.name.trim(), form.email.trim(), form.password);
      }
      // On success AuthContext already shows toast; close modal
      closeModal();
    } catch (err) {
      // AuthContext throws and already uses toasts, but show local message too
      const serverMsg = err?.response?.data?.message;
      setError(serverMsg || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSwitchLink = (type) => {
    // Switch modal view: open new type (this resets form via useEffect above)
    openModal(type);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md"
      onMouseDown={handleOverlayClick}
      aria-modal="true"
      role="dialog"
    >
      <div
        ref={dialogRef}
        onMouseDown={(e) => e.stopPropagation()}
        className="w-full max-w-md mx-4 rounded-3xl shadow-2xl animate-fade-in font-mplus overflow-hidden"
        style={{
          background: "linear-gradient(135deg, hsl(340, 26%, 70%) 0%, hsl(359, 55%, 87%) 100%)",
          backdropFilter: "blur(8px)",
          border: "2px solid hsl(30, 20%, 81%)"
        }}
      >
        {/* Gradient Header */}
        <div
          className="px-6 pt-8 pb-6 text-center relative overflow-hidden"
          style={{ background: "linear-gradient(to bottom, hsl(359, 55%, 87%), hsl(30, 20%, 81%))" }}
        >
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: "radial-gradient(circle at 20% 50%, hsl(26, 44%, 89%), transparent 50%)"
          }}></div>
          <div className="relative z-10">
            <h3 className="text-3xl font-bold text-gray-800 mb-2 font-edu"
              style={{ textShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
              {modalType === "login" ? "Welcome Back" : "Join Rajkonna"}
            </h3>
            <p className="text-sm text-gray-600 font-mplus">
              {modalType === "login" ? "Sign in to your account" : "Create your Rajkonna account"}
            </p>
          </div>
          <button
            onClick={closeModal}
            aria-label="Close"
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/30 transition-all duration-200 text-gray-700 hover:text-gray-900"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form Container */}
        <div className="px-6 py-8 bg-white/90" style={{ background: "linear-gradient(to bottom, rgba(255,255,255,0.95), rgba(255,255,255,0.92))" }}>
          {/* Error Alert */}
          {error && (
            <div className="mb-5 p-3 rounded-xl border-2 border-red-300 bg-red-100/60 text-red-700 text-sm font-medium animate-fade-in"
              style={{ boxShadow: "0 4px 12px rgba(239, 68, 68, 0.15)" }}>
              <span>⚠️ {error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Field (Register only) */}
            {modalType === "register" && (
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                <div className="relative">
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:border-2 transition-all duration-200 focus:shadow-lg"
                    style={{ focusBorderColor: "hsl(359, 55%, 87%)" }}
                    disabled={isSubmitting}
                    autoComplete="name"
                    required
                    onFocus={(e) => e.target.style.borderColor = "hsl(359, 55%, 87%)"}
                    onBlur={(e) => e.target.style.borderColor = "hsl(210, 14%, 83%)"}
                  />
                  <div className="absolute right-3 top-3 text-lg">👤</div>
                </div>
              </div>
            )}

            {/* Email Field */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:border-2 transition-all duration-200 focus:shadow-lg"
                  style={{ focusBorderColor: "hsl(359, 55%, 87%)" }}
                  disabled={isSubmitting}
                  autoComplete="email"
                  required
                  onFocus={(e) => e.target.style.borderColor = "hsl(359, 55%, 87%)"}
                  onBlur={(e) => e.target.style.borderColor = "hsl(210, 14%, 83%)"}
                />
                <div className="absolute right-3 top-3 text-lg">✉️</div>
              </div>
            </div>

            {/* Password Field */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <div className="relative">
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:border-2 transition-all duration-200 focus:shadow-lg"
                  style={{ focusBorderColor: "hsl(359, 55%, 87%)" }}
                  disabled={isSubmitting}
                  autoComplete={modalType === "login" ? "current-password" : "new-password"}
                  required
                  onFocus={(e) => e.target.style.borderColor = "hsl(359, 55%, 87%)"}
                  onBlur={(e) => e.target.style.borderColor = "hsl(210, 14%, 83%)"}
                />
                <div className="absolute right-3 top-3 text-lg">🔒</div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 mt-6 rounded-full font-bold text-white text-lg transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
              style={{
                background: "linear-gradient(135deg, hsl(359, 55%, 87%) 0%, hsl(15, 22%, 46%) 100%)",
                boxShadow: "0 8px 20px rgba(139, 92, 246, 0.25)"
              }}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Processing...
                </span>
              ) : (
                modalType === "login" ? "Sign In" : "Create Account"
              )}
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 mb-2">
              {modalType === "login" ? "New to Rajkonna?" : "Already have an account?"}
            </p>
            <button
              onClick={() => handleSwitchLink(modalType === "login" ? "register" : "login")}
              className="font-bold text-base transition-all duration-200 hover:scale-105"
              style={{ color: "hsl(359, 55%, 87%)" }}
              disabled={isSubmitting}
            >
              {modalType === "login" ? "Create an account" : "Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
