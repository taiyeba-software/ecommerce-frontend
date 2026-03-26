import React, { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AuthContext } from "../../context/AuthContext";
import api from "@/api/axiosInstance";
import { normalizeId } from "../../lib/utils";
import { isAdminOrSeller } from "../../utils/role";

const Products = () => {
  const { user } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/products");
      setProducts(data.products || []);
    } catch (error) {
      console.error("Failed to fetch products:", error);
      toast.error(error.response?.data?.message || "Failed to fetch products");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      await api.delete(`/products/${id}`);
      setProducts((prev) => prev.filter((p) => normalizeId(p._id) !== id));
      toast.success("Product deleted successfully");
    } catch (error) {
      console.error("Failed to delete product:", error);
      toast.error(error.response?.data?.message || "Failed to delete product");
    }
  };

  const handleEdit = (product) => {
    setEditingId(normalizeId(product._id));
    setEditData({
      name: product.name || "",
      category: product.category || "",
      price: Number(product.price) || 0,
      stock: Number(product.stock) || 0,
    });
  };

  const handleSaveEdit = async (id) => {
    try {
      const payload = {
        name: editData.name,
        category: editData.category,
        price: Number(editData.price),
        stock: Number(editData.stock),
      };

      const { data } = await api.patch(`/products/${id}`, payload);
      const updated = data.product || data;

      setProducts((prev) =>
        prev.map((p) => (normalizeId(p._id) === id ? { ...p, ...updated } : p))
      );
      setEditingId(null);
      setEditData(null);
      toast.success("Product updated successfully");
    } catch (error) {
      console.error("Failed to update product:", error);
      toast.error(error.response?.data?.message || "Failed to update product");
    }
  };

  if (!user) {
    return <p className="p-10">Loading...</p>;
  }

  if (!isAdminOrSeller(user)) {
    return <div className="p-10 text-red-500">Access Denied</div>;
  }

  const filteredProducts = products.filter((p) => {
    const query = search.toLowerCase();
    const name = (p.name || "").toLowerCase();
    const category = (p.category || "").toLowerCase();
    return name.includes(query) || category.includes(query);
  });

  return (
    <div style={{ backgroundColor: "hsl(340, 26%, 70%)", minHeight: "100vh", padding: "2rem" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ marginBottom: "2rem" }}>
          <h1
            style={{
              fontSize: "2.5rem",
              fontWeight: "bold",
              color: "hsl(0, 0%, 24%)",
              marginBottom: "1rem",
              fontFamily: "EduNSWACTCursive-SemiBold, cursive",
            }}
          >
            Products Management
          </h1>

          <input
            type="text"
            placeholder="Search products by name or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              maxWidth: "500px",
              padding: "0.75rem 1rem",
              borderRadius: "2rem",
              border: "2px solid hsl(39, 30%, 84%)",
              backgroundColor: "hsl(0, 0%, 100%)",
              color: "hsl(0, 0%, 24%)",
              fontSize: "1rem",
              outline: "none",
            }}
          />
        </div>

        {!loading && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => {
                const productId = normalizeId(product._id);
                const lowStock = Number(product.stock) <= 5;

                return (
                  <div
                    key={productId}
                    style={{
                      backgroundColor: "hsl(359, 55%, 87%)",
                      borderRadius: "0.75rem",
                      padding: "1.5rem",
                      border: lowStock ? "2px solid hsl(0, 84%, 60%)" : "2px solid transparent",
                    }}
                  >
                    {editingId === productId ? (
                      <div>
                        <input
                          type="text"
                          value={editData.name}
                          onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                          style={{
                            width: "100%",
                            padding: "0.5rem",
                            marginBottom: "0.5rem",
                            borderRadius: "0.375rem",
                            border: "1px solid hsl(39, 30%, 84%)",
                            backgroundColor: "hsl(0, 0%, 100%)",
                          }}
                        />
                        <input
                          type="text"
                          value={editData.category}
                          onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                          style={{
                            width: "100%",
                            padding: "0.5rem",
                            marginBottom: "0.5rem",
                            borderRadius: "0.375rem",
                            border: "1px solid hsl(39, 30%, 84%)",
                            backgroundColor: "hsl(0, 0%, 100%)",
                          }}
                        />
                        <input
                          type="number"
                          value={editData.price}
                          onChange={(e) => setEditData({ ...editData, price: Number(e.target.value) })}
                          style={{
                            width: "100%",
                            padding: "0.5rem",
                            marginBottom: "0.5rem",
                            borderRadius: "0.375rem",
                            border: "1px solid hsl(39, 30%, 84%)",
                            backgroundColor: "hsl(0, 0%, 100%)",
                          }}
                        />
                        <input
                          type="number"
                          value={editData.stock}
                          onChange={(e) => setEditData({ ...editData, stock: Number(e.target.value) })}
                          style={{
                            width: "100%",
                            padding: "0.5rem",
                            marginBottom: "1rem",
                            borderRadius: "0.375rem",
                            border: "1px solid hsl(39, 30%, 84%)",
                            backgroundColor: "hsl(0, 0%, 100%)",
                          }}
                        />

                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          <button
                            onClick={() => handleSaveEdit(productId)}
                            style={{
                              flex: 1,
                              backgroundColor: "hsl(120, 60%, 50%)",
                              color: "hsl(0, 0%, 100%)",
                              padding: "0.5rem",
                              borderRadius: "0.375rem",
                              border: "none",
                              cursor: "pointer",
                              fontWeight: "500",
                            }}
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setEditingId(null);
                              setEditData(null);
                            }}
                            style={{
                              flex: 1,
                              backgroundColor: "hsl(0, 0%, 70%)",
                              color: "hsl(0, 0%, 24%)",
                              padding: "0.5rem",
                              borderRadius: "0.375rem",
                              border: "none",
                              cursor: "pointer",
                              fontWeight: "500",
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h2
                          style={{
                            fontSize: "1.25rem",
                            fontWeight: "bold",
                            color: "hsl(0, 0%, 24%)",
                            marginBottom: "0.5rem",
                          }}
                        >
                          {product.name}
                        </h2>
                        <p style={{ color: "hsl(0, 0%, 35%)", marginBottom: "0.5rem" }}>
                          Category: {product.category}
                        </p>
                        <p
                          style={{
                            fontSize: "1.5rem",
                            fontWeight: "bold",
                            color: "hsl(26, 44%, 40%)",
                            marginBottom: "0.5rem",
                          }}
                        >
                          BDT {Number(product.price || 0).toLocaleString()}
                        </p>
                        <p
                          style={{
                            marginBottom: "1rem",
                            padding: "0.5rem",
                            borderRadius: "0.375rem",
                            backgroundColor: lowStock ? "hsl(0, 84%, 85%)" : "hsl(120, 70%, 85%)",
                            color: lowStock ? "hsl(0, 84%, 30%)" : "hsl(120, 60%, 30%)",
                            fontWeight: "500",
                          }}
                        >
                          {lowStock ? "Low stock" : "In stock"}: {product.stock} units
                        </p>

                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          <button
                            onClick={() => handleEdit(product)}
                            style={{
                              flex: 1,
                              backgroundColor: "hsl(26, 44%, 89%)",
                              color: "hsl(0, 0%, 24%)",
                              padding: "0.625rem",
                              borderRadius: "0.375rem",
                              border: "none",
                              cursor: "pointer",
                              fontWeight: "500",
                            }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(productId)}
                            style={{
                              flex: 1,
                              backgroundColor: "hsl(0, 84%, 60%)",
                              color: "hsl(0, 0%, 100%)",
                              padding: "0.625rem",
                              borderRadius: "0.375rem",
                              border: "none",
                              cursor: "pointer",
                              fontWeight: "500",
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })
            ) : (
              <div
                style={{
                  gridColumn: "1 / -1",
                  textAlign: "center",
                  padding: "2rem",
                  color: "hsl(0, 0%, 35%)",
                }}
              >
                <p>No products found matching "{search}"</p>
              </div>
            )}
          </div>
        )}

        {loading && (
          <div style={{ textAlign: "center", padding: "2rem", color: "hsl(0, 0%, 24%)" }}>
            <p>Loading products...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
