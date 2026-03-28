import React, { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AuthContext } from "../../context/AuthContext";
import api from "@/api/axiosInstance";
import { isAdminOrSeller } from "../../utils/role";

const Orders = () => {
  const { user, authLoading } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [expandedDetails, setExpandedDetails] = useState({});

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/orders?page=1&limit=100");
      setOrders(data.orders || []);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      toast.error(error.response?.data?.message || "Failed to fetch orders");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading || !user || !isAdminOrSeller(user)) return;
    fetchOrders();
  }, [authLoading, user]);

  const fetchOrderDetails = async (id) => {
    if (expandedDetails[id]) return;
    try {
      const { data } = await api.get(`/orders/${id}`);
      setExpandedDetails((prev) => ({ ...prev, [id]: data }));
    } catch (error) {
      console.error("Failed to fetch order details:", error);
      toast.error(error.response?.data?.message || "Failed to fetch order details");
    }
  };

  const handleToggleExpand = async (id) => {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(id);
    await fetchOrderDetails(id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;

    try {
      await api.delete(`/orders/${id}`);
      setOrders((prev) => prev.filter((o) => o._id !== id));
      setExpandedDetails((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      if (expandedId === id) setExpandedId(null);
      toast.success("Order deleted successfully");
    } catch (error) {
      console.error("Failed to delete order:", error);
      toast.error(error.response?.data?.message || "Failed to delete order");
    }
  };

  const getStatusColor = (status) => {
    switch ((status || "").toLowerCase()) {
      case "pending":
        return "hsl(39, 100%, 60%)";
      case "processing":
        return "hsl(200, 100%, 50%)";
      case "shipped":
        return "hsl(200, 70%, 70%)";
      case "delivered":
        return "hsl(120, 60%, 50%)";
      case "cancelled":
        return "hsl(0, 84%, 60%)";
      default:
        return "hsl(0, 0%, 70%)";
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: "Pending",
      processing: "Processing",
      shipped: "Shipped",
      delivered: "Delivered",
      cancelled: "Cancelled",
    };
    return statusMap[(status || "").toLowerCase()] || status || "Unknown";
  };

  if (authLoading) {
    return <p className="p-10" style={{ color: "hsl(0, 0%, 24%)" }}>Loading...</p>;
  }

  if (!user) {
    return (
      <div className="p-10" style={{ color: "hsl(0, 0%, 24%)" }}>
        Please log in to access orders management.
      </div>
    );
  }

  if (!isAdminOrSeller(user)) {
    return <div className="p-10 text-red-500">Access Denied</div>;
  }

  return (
    <div style={{ backgroundColor: "hsl(340, 26%, 70%)", minHeight: "100vh", padding: "2rem" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ marginBottom: "2rem", textAlign: "center" }}>
          <h1
            style={{
              fontSize: "2.5rem",
              fontWeight: "bold",
              color: "hsl(0, 0%, 24%)",
              marginBottom: "0.5rem",
              fontFamily: "EduNSWACTCursive-SemiBold, cursive",
            }}
          >
            Orders Management
          </h1>
          <p style={{ color: "hsl(0, 0%, 35%)", fontSize: "1rem" }}>Total Orders: {orders.length}</p>
        </div>

        {!loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {orders.length > 0 ? (
              orders.map((order) => {
                const detail = expandedDetails[order._id] || order;
                const total = Number(detail.totalPayable ?? detail.total ?? 0);
                const items = Array.isArray(detail.items) ? detail.items : [];
                const customer = detail.user || {};

                return (
                  <div
                    key={order._id}
                    style={{
                      backgroundColor: "hsl(30, 20%, 81%)",
                      borderRadius: "0.75rem",
                      overflow: "hidden",
                      boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
                      border: "2px solid hsl(39, 30%, 84%)",
                    }}
                  >
                    <div
                      onClick={() => handleToggleExpand(order._id)}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "1rem 1.5rem",
                        cursor: "pointer",
                        backgroundColor: "hsl(30, 20%, 81%)",
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: "0.875rem", color: "hsl(0, 0%, 35%)", marginBottom: "0.25rem" }}>
                          Order ID: {order._id}
                        </p>
                        <p style={{ fontSize: "1.25rem", fontWeight: "bold", color: "hsl(0, 0%, 24%)" }}>
                          BDT {total.toLocaleString()}
                        </p>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <span
                          style={{
                            display: "inline-block",
                            backgroundColor: getStatusColor(order.status),
                            color:
                              (order.status || "").toLowerCase() === "pending"
                                ? "hsl(0, 0%, 24%)"
                                : "hsl(0, 0%, 100%)",
                            padding: "0.5rem 1rem",
                            borderRadius: "2rem",
                            fontSize: "0.875rem",
                            fontWeight: "600",
                          }}
                        >
                          {getStatusBadge(order.status)}
                        </span>

                        <span
                          style={{
                            color: "hsl(0, 0%, 35%)",
                            fontSize: "1.5rem",
                            transform: expandedId === order._id ? "rotate(180deg)" : "rotate(0deg)",
                            transition: "transform 0.3s ease",
                          }}
                        >
                          v
                        </span>
                      </div>
                    </div>

                    {expandedId === order._id && (
                      <div
                        style={{
                          padding: "1.5rem",
                          borderTop: "1px solid hsl(39, 30%, 84%)",
                          backgroundColor: "hsl(0, 0%, 100%)",
                        }}
                      >
                        <div style={{ marginBottom: "1.5rem" }}>
                          <h3 style={{ fontWeight: "bold", color: "hsl(0, 0%, 24%)", marginBottom: "0.75rem" }}>
                            Order Details
                          </h3>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                            <div>
                              <p style={{ fontSize: "0.875rem", color: "hsl(0, 0%, 35%)", marginBottom: "0.25rem" }}>
                                Customer
                              </p>
                              <p style={{ fontWeight: "500", color: "hsl(0, 0%, 24%)" }}>
                                {customer.name || "N/A"}
                              </p>
                            </div>
                            <div>
                              <p style={{ fontSize: "0.875rem", color: "hsl(0, 0%, 35%)", marginBottom: "0.25rem" }}>
                                Email
                              </p>
                              <p style={{ fontWeight: "500", color: "hsl(0, 0%, 24%)" }}>
                                {customer.email || "N/A"}
                              </p>
                            </div>
                            <div>
                              <p style={{ fontSize: "0.875rem", color: "hsl(0, 0%, 35%)", marginBottom: "0.25rem" }}>
                                Date
                              </p>
                              <p style={{ fontWeight: "500", color: "hsl(0, 0%, 24%)" }}>
                                {detail.createdAt ? new Date(detail.createdAt).toLocaleDateString() : "N/A"}
                              </p>
                            </div>
                            <div>
                              <p style={{ fontSize: "0.875rem", color: "hsl(0, 0%, 35%)", marginBottom: "0.25rem" }}>
                                Payment
                              </p>
                              <p style={{ fontWeight: "500", color: "hsl(0, 0%, 24%)" }}>
                                {detail.paymentMethod || "N/A"}
                              </p>
                            </div>
                          </div>
                        </div>

                        {items.length > 0 && (
                          <div style={{ marginBottom: "1.5rem" }}>
                            <h3 style={{ fontWeight: "bold", color: "hsl(0, 0%, 24%)", marginBottom: "0.75rem" }}>
                              Items ({items.length})
                            </h3>
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                              {items.map((item, idx) => {
                                const qty = Number(item.qty ?? item.quantity ?? 0);
                                const itemName = item.product?.name || item.name || "Unknown Item";
                                const itemTotal = Number(item.lineTotal ?? (item.priceAt || item.price || 0) * qty);

                                return (
                                  <div
                                    key={`${order._id}-${idx}`}
                                    style={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      padding: "0.75rem",
                                      backgroundColor: "hsl(340, 26%, 95%)",
                                      borderRadius: "0.375rem",
                                      borderLeft: "3px solid hsl(26, 44%, 89%)",
                                    }}
                                  >
                                    <div>
                                      <p style={{ fontWeight: "500", color: "hsl(0, 0%, 24%)", marginBottom: "0.25rem" }}>
                                        {itemName}
                                      </p>
                                      <p style={{ fontSize: "0.875rem", color: "hsl(0, 0%, 35%)" }}>
                                        Qty: {qty}
                                      </p>
                                    </div>
                                    <p style={{ fontWeight: "bold", color: "hsl(26, 44%, 40%)" }}>
                                      BDT {itemTotal.toLocaleString()}
                                    </p>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
                          <button
                            onClick={() => handleDelete(order._id)}
                            style={{
                              flex: 1,
                              backgroundColor: "hsl(0, 84%, 60%)",
                              color: "hsl(0, 0%, 100%)",
                              padding: "0.75rem",
                              borderRadius: "0.375rem",
                              border: "none",
                              cursor: "pointer",
                              fontWeight: "500",
                            }}
                          >
                            Delete Order
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: "3rem 1rem",
                  backgroundColor: "hsl(0, 0%, 100%)",
                  borderRadius: "0.75rem",
                  color: "hsl(0, 0%, 35%)",
                }}
              >
                <p style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>No orders found</p>
                <p style={{ fontSize: "0.875rem" }}>Orders will appear here once customers place them</p>
              </div>
            )}
          </div>
        )}

        {loading && (
          <div style={{ textAlign: "center", padding: "2rem", color: "hsl(0, 0%, 24%)" }}>
            <p>Loading orders...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
