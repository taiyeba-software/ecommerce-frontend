import React, { useState } from "react";
import { useProducts } from "../context/useProducts";
import { useAuth } from "../context/AuthContext";
import { isAdminOrSeller } from "../utils/role";

const AddProduct = () => {
  const { addProduct } = useProducts();
  const { user } = useAuth();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("");
  const [images, setImages] = useState([]);

  const handleFileChange = (e) => {
    setImages([...e.target.files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("stock", stock);
    formData.append("category", category);
    images.forEach((file) => formData.append("images", file));

    await addProduct(formData, user);

    setName(""); setDescription(""); setPrice(""); setStock(""); setCategory(""); setImages([]);
  };

  if (!user) {
    return <p className="text-center mt-10">Loading...</p>;
  }

  if (!isAdminOrSeller(user)) {
    return <p className="text-center mt-10 text-red-500">Access denied.</p>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Add New Product</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow space-y-4">
        <input type="text" placeholder="Product Name" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 border rounded" required />
        <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full p-2 border rounded" required />
        <input type="number" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full p-2 border rounded" required />
        <input type="number" placeholder="Stock" value={stock} onChange={(e) => setStock(e.target.value)} className="w-full p-2 border rounded" required />
        <input type="text" placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-2 border rounded" required />
        <input type="file" multiple onChange={handleFileChange} className="w-full p-2 border rounded" />
        <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition">Add Product</button>
      </form>
    </div>
  );
};

export default AddProduct;
