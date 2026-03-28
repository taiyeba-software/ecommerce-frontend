/*
import React, { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AuthContext } from "../../context/AuthContext";
import api from "@/api/axiosInstance";
import { normalizeId } from "../../lib/utils";
import { isAdminOrSeller } from "../../utils/role";

const Products = () => {
  const { user } = useContext(AuthContext);
  console.log("USER DEBUG:", user);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState(null);

            <p>Loading products...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
*/
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

  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "",
    price: "",
    stock: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const getProductImage = (product) => {
    if (!product) return null;
    if (typeof product.image === "string") return product.image;
    if (Array.isArray(product.images) && product.images.length > 0) {
      const first = product.images[0];
      if (typeof first === "string") return first;
      if (first && typeof first.url === "string") return first.url;
    }
    return null;
  };

  // FETCH
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/products");
      setProducts(data.products || []);
    } catch {
      toast.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleCreate = async () => {
    try {
      const formData = new FormData();
      formData.append("name", newProduct.name);
      formData.append("category", newProduct.category);
      formData.append("price", newProduct.price);
      formData.append("stock", newProduct.stock);

      if (imageFile) formData.append("images", imageFile);

      await api.post("/products", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Product created");
      setNewProduct({ name: "", category: "", price: "", stock: "" });
      setImageFile(null);
      setPreview(null);
      fetchProducts();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Create failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await api.delete(`/products/${id}`);
      setProducts((prev) => prev.filter((p) => normalizeId(p._id) !== id));
      toast.success("Deleted");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Delete failed");
    }
  };

  const handleEdit = (product) => {
    setEditingId(normalizeId(product._id));
    setEditData({
      name: product?.name || "",
      category: product?.category || "",
      price: product?.price || "",
      stock: product?.stock || "",
    });
    setPreview(getProductImage(product));
    setImageFile(null);
  };

  const handleSaveEdit = async (id) => {
    try {
      const formData = new FormData();
      formData.append("name", editData.name);
      formData.append("category", editData.category);
      formData.append("price", editData.price);
      formData.append("stock", editData.stock);

      if (imageFile) formData.append("images", imageFile);

      const { data } = await api.patch(`/products/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const updated = data.product || data;

      setProducts((prev) =>
        prev.map((p) => (normalizeId(p._id) === id ? updated : p))
      );

      setEditingId(null);
      setEditData(null);
      setImageFile(null);
      setPreview(null);

      toast.success("Updated");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Update failed");
    }
  };

  if (!user) return <p className="p-10" style={{ color: "#1f1f1f" }}>Loading...</p>;
  if (!isAdminOrSeller(user))
    return <div className="p-10 text-red-500">Access Denied</div>;

  const filteredProducts = products.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q)
    );
  });

  const baseInputStyle = {
    width: "100%",
    padding: "0.6rem 0.75rem",
    marginTop: "0.5rem",
    borderRadius: "6px",
    border: "1px solid #cfcfcf",
    backgroundColor: "#fff",
    color: "#1f1f1f",
  };

  return (
    <div style={{ backgroundColor: "hsl(340, 26%, 70%)", minHeight: "100vh", padding: "2rem" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

        <h1 style={{ fontSize: "2.5rem", color: "#333", marginBottom: "1rem" }}>
          Products Management
        </h1>

        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            maxWidth: "500px",
            padding: "0.75rem 1rem",
            borderRadius: "25px",
            border: "2px solid #ddd",
            background: "#fff",
            color: "#333",
            marginBottom: "2rem",
          }}
        />

        <div
          style={{
            background: "#fff",
            padding: "1rem",
            borderRadius: "10px",
            marginBottom: "2rem",
            color: "#1f1f1f",
          }}
        >
          <h3 style={{ fontWeight: 700 }}>Add New Product</h3>

          <input placeholder="Name" value={newProduct.name}
            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
            style={baseInputStyle}
          />

          <input placeholder="Category" value={newProduct.category}
            onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
            style={baseInputStyle}
          />

          <input type="number" placeholder="Price"
            value={newProduct.price}
            onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
            style={baseInputStyle}
          />

          <input type="number" placeholder="Stock"
            value={newProduct.stock}
            onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
            style={baseInputStyle}
          />

          <input
            type="file"
            onChange={(e) => {
              const file = e.target.files?.[0] || null;
              setImageFile(file);
              setPreview(file ? URL.createObjectURL(file) : null);
            }}
            style={{ ...baseInputStyle, padding: "0.4rem 0.5rem" }}
          />

          {preview && <img src={preview} alt="Preview" style={{ width: "100px", marginTop: "10px", borderRadius: "6px" }} />}

          <button
            onClick={handleCreate}
            style={{
              marginTop: "10px",
              background: "#4CAF50",
              color: "white",
              padding: "10px",
              borderRadius: "5px",
            }}
          >
            Add Product
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1rem" }}>
          {filteredProducts.map((p) => {
            const id = normalizeId(p._id);

            return (
              <div
                key={id}
                style={{
                  background: "#fce4ec",
                  padding: "1rem",
                  borderRadius: "10px",
                  color: "#1f1f1f",
                }}
              >
                {editingId === id ? (
                  <>
                    <input value={editData.name}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                      style={baseInputStyle}
                    />

                    <input value={editData.category}
                      onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                      style={baseInputStyle}
                    />

                    <input value={editData.price}
                      onChange={(e) => setEditData({ ...editData, price: e.target.value })}
                      style={baseInputStyle}
                    />

                    <input value={editData.stock}
                      onChange={(e) => setEditData({ ...editData, stock: e.target.value })}
                      style={baseInputStyle}
                    />

                    <input type="file"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setImageFile(file);
                        setPreview(file ? URL.createObjectURL(file) : null);
                      }}
                      style={{ ...baseInputStyle, padding: "0.4rem 0.5rem" }}
                    />

                    {preview && <img src={preview} alt="Preview" style={{ width: "100%", borderRadius: "8px" }} />}

                    <button onClick={() => handleSaveEdit(id)} style={{ marginTop: "0.5rem", color: "#1f1f1f" }}>
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditingId(null);
                        setEditData(null);
                        setImageFile(null);
                        setPreview(null);
                      }}
                      style={{ marginTop: "0.5rem", marginLeft: "0.5rem", color: "#1f1f1f" }}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    {getProductImage(p) && (
                      <img
                        src={getProductImage(p)}
                        alt={p.name || "Product image"}
                        style={{ width: "100%", height: "200px", objectFit: "cover" }}
                      />
                    )}

                    <h3>{p.name}</h3>
                    <p>{p.category}</p>
                    <p>BDT {p.price}</p>

                    <div style={{ display: "flex", gap: "10px" }}>
                      <button onClick={() => handleEdit(p)} style={editButtonStyle}>
                        Edit
                      </button>

                      <button onClick={() => handleDelete(id)} style={deleteButtonStyle}>
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}

          {filteredProducts.length === 0 && !loading && (
            <div
              style={{
                gridColumn: "1 / -1",
                background: "#fff",
                color: "#1f1f1f",
                borderRadius: "10px",
                padding: "1rem",
                textAlign: "center",
              }}
            >
              No products found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;