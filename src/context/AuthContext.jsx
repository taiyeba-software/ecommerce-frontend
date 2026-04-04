
/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useEffect, useContext } from "react";
import toast from "react-hot-toast";
import api from "@/api/axiosInstance";

export const AuthContext = createContext();

const toRole = (value) => (typeof value === "string" ? value.trim().toLowerCase() : "");

const normalizeUser = (rawUser) => {
  if (!rawUser) return null;
  const role = toRole(rawUser.role);
  if (role) return { ...rawUser, role };
  if (rawUser.isAdmin === true) return { ...rawUser, role: "admin" };
  return { ...rawUser };
};

const extractUserFromAuthPayload = (data) => {
  if (!data) return null;
  if (data.user) return normalizeUser(data.user);
  if (data.data?.user) return normalizeUser(data.data.user);
  if (data.profile) return normalizeUser(data.profile);
  if (data.data?.profile) return normalizeUser(data.data.profile);
  return normalizeUser(data);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // 🔴 Sync guest cart to authenticated user
  const syncGuestCart = async () => {
    try {
      const guestCartData = localStorage.getItem("guestCart");
      if (!guestCartData) return;
      
      const guestCart = JSON.parse(guestCartData);
      if (!guestCart.items || guestCart.items.length === 0) {
        localStorage.removeItem("guestCart");
        return;
      }
      
      await api.post("/cart/sync", {
        items: guestCart.items
      });
      
      localStorage.removeItem("guestCart");
    } catch (err) {
      console.error("syncGuestCart error:", err);
    }
  };

  const hydrateFromProfile = async (fallbackUser = null) => {
    try {
      const { data } = await api.get("/auth/profile");
      const profileUser = extractUserFromAuthPayload(data);
      if (profileUser) {
        setUser(profileUser);
        localStorage.setItem("user", JSON.stringify(profileUser));
        return profileUser;
      }
    } catch {
      // Keep silent: profile endpoint may fail if not authenticated yet.
    }
    if (fallbackUser) {
      setUser(fallbackUser);
      localStorage.setItem("user", JSON.stringify(fallbackUser));
    }
    return fallbackUser;
  };

  // Example: fetch user info from API or localStorage
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const storedUser = localStorage.getItem("user");

        if (storedUser) {
          const parsedUser = normalizeUser(JSON.parse(storedUser));
          if (mounted) {
            setUser(parsedUser);
            localStorage.setItem("user", JSON.stringify(parsedUser));
          }
          await hydrateFromProfile(parsedUser);
          return;
        }

        await hydrateFromProfile();
      } catch {
        if (mounted) {
          setUser(null);
          localStorage.removeItem("user");
        }
      } finally {
        if (mounted) setAuthLoading(false);
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await api.post("/auth/login", { email, password });
      const normalizedUser = extractUserFromAuthPayload(data);
      if (normalizedUser?.role) {
        setUser(normalizedUser);
        localStorage.setItem("user", JSON.stringify(normalizedUser));
      } else {
        await hydrateFromProfile(normalizedUser);
      }
      await syncGuestCart();
      toast.success("Logged in successfully!");
      return normalizedUser;
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
      throw err;
    }
  };

  const register = async (name, email, password) => {
    try {
      const { data } = await api.post("/auth/register", { name, email, password });
      const normalizedUser = extractUserFromAuthPayload(data);
      if (normalizedUser?.role) {
        setUser(normalizedUser);
        localStorage.setItem("user", JSON.stringify(normalizedUser));
      } else {
        await hydrateFromProfile(normalizedUser);
      }
      await syncGuestCart();
      toast.success("Registered successfully!");
      return normalizedUser;
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
      setUser(null);
      localStorage.removeItem("user");
      toast.success("Logged out successfully!");
    } catch {
      toast.error("Logout failed");
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, authLoading, login, register, logout, refreshAuth: hydrateFromProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
