import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useProducts } from "../context/useProducts";
import { useAuth } from "../context/AuthContext";
import { isAdminOrSeller } from "../utils/role";

const EditProduct = () => {
  const { id } = useParams(); // product id from URL
  const { products, editProduct, fetchProducts } = useProducts();
  const { user } = useAuth();

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
  });

  useEffect(() => {
    if (products.length === 0) fetchProducts(); // fetch if empty
    const product = products.find((p) => p._id === id);
    if (product) {
      setForm({
        name: product.name,
        description: product.description,
        price: product.price,
        image: product.image,
      });
    }
  }, [products, id, fetchProducts]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.description || !form.price || !form.image) {
      return alert("All fields are required!");
    }
    editProduct(id, { ...form, price: parseFloat(form.price) }, user);
  };

  if (!user) {
    return <p className="text-center mt-10">Loading...</p>;
  }

  if (!isAdminOrSeller(user)) {
    return <p className="text-center mt-10 text-red-500">Access denied.</p>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow rounded mt-10">
      <h1 className="text-2xl font-bold mb-6 text-center">Edit Product</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          name="name"
          placeholder="Product Name"
          value={form.name}
          onChange={handleChange}
          className="border p-2 rounded"
        />
        <textarea
          name="description"
          placeholder="Product Description"
          value={form.description}
          onChange={handleChange}
          className="border p-2 rounded"
        />
        <input
          type="number"
          name="price"
          placeholder="Price"
          value={form.price}
          onChange={handleChange}
          className="border p-2 rounded"
        />
        <input
          type="text"
          name="image"
          placeholder="Image URL"
          value={form.image}
          onChange={handleChange}
          className="border p-2 rounded"
        />
        <button
          type="submit"
          className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 transition"
        >
          Update Product
        </button>
      </form>
    </div>
  );
};

export default EditProduct;
