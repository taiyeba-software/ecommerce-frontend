import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { gsap } from 'gsap';
import api from '@/api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { isAdminOrSeller } from "../utils/role";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const tbodyRef = useRef(null);




  // Fetch orders
  const fetchOrders = async (currentPage = 1) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get(`/orders?page=${currentPage}&limit=10`);
      setOrders(data.orders || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };



  // Fetch order details
  const fetchOrderDetails = async (orderId) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get(`/orders/${orderId}`);
      setSelectedOrder(data);
      setSelectedOrderId(orderId);
      setShowDetails(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load order details');
      toast.error('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(page);
  }, [page]);

  useEffect(() => {
    if (tbodyRef.current) {
      const rows = tbodyRef.current.querySelectorAll('tr[data-id]');
      rows.forEach(row => {
        const rowId = row.getAttribute('data-id');
        if (rowId === selectedOrderId) {
          gsap.to(row, { backgroundColor: '#fb6f92', duration: 1, ease: 'sine.out' });
        } else {
          gsap.to(row, { backgroundColor: '#f5f5f5', duration: 1, ease: 'sine.out' }); // Assuming bg-card2 is #f5f5f5
        }
      });
    }
  }, [selectedOrderId]);

  const handleViewOrder = (orderId) => {
    fetchOrderDetails(orderId);
  };

  const handleDeleteOrder = async (orderId) => {

    // ✅ Admin check FIRST
    if (!isAdminOrSeller(user)) {
      return toast.error("Only admin can delete the order");
    }

    if (!confirm("Are you sure you want to delete this order?")) return;

    try {
      await api.delete(`/orders/${orderId}`);
      toast.success("Order deleted successfully");
      fetchOrders(page);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-[#7ca4a1]">Dashboard</h1>
          <button
            onClick={() => navigate(-1)}
            className="cosmic-button"
          >
            Back
          </button>
        </div>

        {error && <div className="text-red-500 mb-4">{error}</div>}

        {/* Orders List */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Orders List</h2>
          {orders.length === 0 && !loading && <div>No orders found.</div>}
          {orders.length > 0 && (
            <div className="overflow-x-auto relative">
              {loading && (
                <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                  <div>Loading...</div>
                </div>
              )}
              <table className="w-full border-collapse border border-border text-black">
                <thead>
                  <tr className="bg-card1">
                    <th className="border border-border p-2">Status</th>
                    <th className="border border-border p-2">Total Payable</th>
                    <th className="border border-border p-2">Actions</th>
                  </tr>
                </thead>
                <tbody ref={tbodyRef}>
                  {orders.map((order) => (
                    <tr key={order._id} data-id={order._id} style={{ backgroundColor: '#f5f5f5' }}>
                      <td className="border border-border p-2">{order.status}</td>
                      <td className="border border-border p-2">৳{order.totalPayable}</td>
                      <td className="border border-border p-2">
                        <button
                          onClick={() => handleViewOrder(order._id)}
                          disabled={loading}
                          className="cosmic-button text-sm mr-2"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDeleteOrder(order._id)}
                          disabled={loading}
                          className="text-white px-2 py-1 rounded text-sm hover:opacity-80"
                          style={{ backgroundColor: loading ? 'gray' : 'crimson' }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {/* Pagination */}
          <div className="flex justify-between mt-4">
            <button
              onClick={handlePrevPage}
              disabled={page === 1}
              className="cosmic-button disabled:opacity-50"
            >
              Prev
            </button>
            <span>Page {page} of {totalPages}</span>
            <button
              onClick={handleNextPage}
              disabled={page === totalPages}
              className="cosmic-button disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>

        {/* Order Details */}
        {showDetails && selectedOrder && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Order Details</h2>
            {/* Order Summary */}
            <div className="bg-card2 p-4 rounded text-black">
              <h3 className="text-xl font-semibold mb-3 text-[#7ca4a1]">Order Summary</h3>

              {/* Customer Details */}
              <div className="mb-4">
                <h4 className="text-lg font-medium">Customer</h4>
                {selectedOrder.user ? (
                  <div className="text-sm">
                    <div>Name: {selectedOrder.user.name || 'N/A'}</div>
                    <div>Phone: {selectedOrder.user.phone || 'N/A'}</div>
                    <div>Email: {selectedOrder.user.email || 'N/A'}</div>
                    <div>Address: {selectedOrder.user.address ? JSON.stringify(selectedOrder.user.address) : 'N/A'}</div>
                  </div>
                ) : (
                  <div className="text-sm">Customer details not available</div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Status:</span>
                  <span className="text-sm font-medium">{selectedOrder.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Payment Method:</span>
                  <span className="text-sm font-medium">{selectedOrder.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Subtotal:</span>
                  <span className="text-sm">৳{selectedOrder.subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Delivery Charge:</span>
                  <span className="text-sm">৳{selectedOrder.deliveryCharge}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Discount:</span>
                  <span className="text-sm text-green-600">-৳{selectedOrder.discountAmount}</span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between font-semibold">
                  <span className="text-sm">Total Payable:</span>
                  <span className="text-sm">৳{selectedOrder.totalPayable}</span>
                </div>
              </div>
            </div>

            {/* Items List */}
            <div className="bg-card2 p-4 rounded mt-6">
              <h3 className="text-xl font-semibold mb-3 text-[#7ca4a1]">Items</h3>
              <div className="space-y-3 text-black">
                {selectedOrder.items && selectedOrder.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-background/50 rounded">
                    <div className="flex-1">
                      <span className="font-medium text-sm">
                        {item.product && item.product.name ? item.product.name : 'Unknown Product'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span>Qty: {item.qty}</span>
                      <span className="font-medium">৳{item.lineTotal}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}


      </div>
    </div>
  );
};

export default AdminDashboard;
