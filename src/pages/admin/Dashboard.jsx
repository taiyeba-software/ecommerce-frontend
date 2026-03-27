import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { AuthContext } from "../../context/AuthContext";
import api from "@/api/axiosInstance";
import { isAdminOrSeller } from "../../utils/role";

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  console.log("USER DEBUG:", user);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productsRes, ordersRes] = await Promise.all([
          api.get("/products"),
          api.get("/orders?page=1&limit=100"),
        ]);

        setProducts(productsRes.data?.products || []);
        setOrders(ordersRes.data?.orders || []);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        toast.error(error.response?.data?.message || "Failed to load dashboard data");
        setProducts([]);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (!user) {
    return <p className="p-10">Loading...</p>;
  }

  if (!isAdminOrSeller(user)) {
    return <div className="p-10 text-red-500">Access Denied</div>;
  }

  const lowStockProducts = products.filter((p) => Number(p.stock || 0) <= 5);
  const totalRevenue = orders.reduce(
    (sum, order) => sum + Number(order.totalPayable ?? order.total ?? 0),
    0
  );

  return (
    <div style={{ backgroundColor: "hsl(340, 26%, 70%)", minHeight: "100vh", padding: "2rem" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ marginBottom: "3rem", textAlign: "center" }}>
          <h1
            style={{
              fontSize: "2.5rem",
              fontWeight: "bold",
              color: "hsl(0, 0%, 24%)",
              marginBottom: "0.5rem",
              fontFamily: "EduNSWACTCursive-SemiBold, cursive",
            }}
          >
            Admin Dashboard
          </h1>
          <p style={{ color: "hsl(0, 0%, 35%)", fontSize: "1rem" }}>
            Welcome to Rajkonna Admin Panel
          </p>
        </div>

        {!loading && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "1.5rem",
              marginBottom: "2rem",
            }}
          >
            <div
              style={{
                backgroundColor: "hsl(359, 55%, 87%)",
                padding: "1.5rem",
                borderRadius: "0.75rem",
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
              }}
            >
              <h3 style={{ color: "hsl(0, 0%, 24%)", fontSize: "0.875rem", marginBottom: "0.5rem" }}>
                Total Products
              </h3>
              <p style={{ fontSize: "2rem", fontWeight: "bold", color: "hsl(359, 55%, 40%)" }}>
                {products.length}
              </p>
            </div>

            <div
              style={{
                backgroundColor: "hsl(30, 20%, 81%)",
                padding: "1.5rem",
                borderRadius: "0.75rem",
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
              }}
            >
              <h3 style={{ color: "hsl(0, 0%, 24%)", fontSize: "0.875rem", marginBottom: "0.5rem" }}>
                Total Orders
              </h3>
              <p style={{ fontSize: "2rem", fontWeight: "bold", color: "hsl(30, 20%, 40%)" }}>
                {orders.length}
              </p>
            </div>

            <div
              style={{
                backgroundColor: "hsl(15, 22%, 46%)",
                padding: "1.5rem",
                borderRadius: "0.75rem",
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2)",
              }}
            >
              <h3 style={{ color: "hsl(0, 0%, 95%)", fontSize: "0.875rem", marginBottom: "0.5rem" }}>
                Low Stock Items
              </h3>
              <p style={{ fontSize: "2rem", fontWeight: "bold", color: "hsl(0, 84%, 60%)" }}>
                {lowStockProducts.length}
              </p>
            </div>

            <div
              style={{
                backgroundColor: "hsl(26, 44%, 89%)",
                padding: "1.5rem",
                borderRadius: "0.75rem",
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
              }}
            >
              <h3 style={{ color: "hsl(0, 0%, 24%)", fontSize: "0.875rem", marginBottom: "0.5rem" }}>
                Total Revenue
              </h3>
              <p style={{ fontSize: "2rem", fontWeight: "bold", color: "hsl(26, 44%, 40%)" }}>
                BDT {totalRevenue.toLocaleString()}
              </p>
            </div>
          </div>
        )}

        <div style={{ marginBottom: "2rem" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "hsl(0, 0%, 24%)", marginBottom: "1rem" }}>
            Quick Actions
          </h2>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <Link to="/admin/products">
              <button
                style={{
                  backgroundColor: "hsl(26, 44%, 89%)",
                  color: "hsl(0, 0%, 24%)",
                  padding: "0.75rem 1.5rem",
                  borderRadius: "2rem",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: "500",
                }}
              >
                Manage Products
              </button>
            </Link>
            <Link to="/admin/orders">
              <button
                style={{
                  backgroundColor: "hsl(359, 55%, 87%)",
                  color: "hsl(0, 0%, 24%)",
                  padding: "0.75rem 1.5rem",
                  borderRadius: "2rem",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: "500",
                }}
              >
                View Orders
              </button>
            </Link>
          </div>
        </div>

        {lowStockProducts.length > 0 && (
          <div
            style={{
              backgroundColor: "hsl(0, 84%, 85%)",
              border: "2px solid hsl(0, 84%, 60%)",
              padding: "1.5rem",
              borderRadius: "0.75rem",
              marginBottom: "2rem",
            }}
          >
            <h3 style={{ color: "hsl(0, 84%, 30%)", marginBottom: "1rem", fontWeight: "bold" }}>
              Alert: Low Stock Items
            </h3>
            <ul style={{ listStyle: "none", padding: 0 }}>
              {lowStockProducts.map((product) => (
                <li
                  key={product._id}
                  style={{
                    padding: "0.5rem",
                    color: "hsl(0, 84%, 30%)",
                    borderBottom: "1px solid hsl(0, 84%, 70%)",
                  }}
                >
                  {product.name} - Stock: {product.stock} units
                </li>
              ))}
            </ul>
          </div>
        )}

        {loading && (
          <div style={{ textAlign: "center", padding: "2rem", color: "hsl(0, 0%, 24%)" }}>
            <p>Loading dashboard data...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
