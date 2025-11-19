// src/pages/Owner/AddItem.jsx
import React, { useState } from "react";
import { useItemStore } from "../../store/useItemStore";
import { useNavigate } from "react-router-dom";

const AddItem = () => {
  const navigate = useNavigate();
  const { addItem, loading } = useItemStore();

  const [form, setForm] = useState({
    name: "",
    category: "",
    price: "",
    foodType: "Veg",
    description: "",
    image: "",
    isAvailable: true,
  });

  // 🟢 Handle input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // 🟡 Image upload (convert to base64)
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () =>
      setForm((prev) => ({ ...prev, image: reader.result }));
    reader.readAsDataURL(file);
  };

  // 🟣 Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addItem(form);
      alert("✅ Item added successfully!");
      navigate("/"); // redirect to dashboard
      
    } catch (err) {
      alert("❌ Failed to add item.");
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 border rounded-lg shadow">
      <h2 className="text-2xl font-semibold mb-4 text-center">Add New Item</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Item Name"
          value={form.name}
          onChange={handleChange}
          className="border p-2 w-full rounded"
          required
        />

        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          className="border p-2 w-full rounded"
          required
        >
          <option value="">Select Category</option>
          <option value="Snacks">Snacks</option>
          <option value="Main Course">Main Course</option>
          <option value="Dessert">Dessert</option>
          <option value="Pizza">Pizza</option>
          <option value="Sandwich">Sandwich</option>
          <option value="South Indian">South Indian</option>
          <option value="North Indian">North Indian</option>
          <option value="Chinese">Chinese</option>
          <option value="Fast Food">Fast Food</option>
          <option value="Others">Others</option>
        </select>

        <input
          type="number"
          name="price"
          placeholder="Price"
          value={form.price}
          onChange={handleChange}
          className="border p-2 w-full rounded"
          required
        />

        <select
          name="foodType"
          value={form.foodType}
          onChange={handleChange}
          className="border p-2 w-full rounded"
        >
          <option value="Veg">Veg</option>
          <option value="Non-Veg">Non-Veg</option>
        </select>

        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          className="border p-2 w-full rounded"
          rows="3"
        />

        <input
          type="file"
          onChange={handleImageUpload}
          className="border p-2 w-full rounded"
          accept="image/*"
          required
        />

        {form.image && (
          <img
            src={form.image}
            alt="Preview"
            className="w-32 h-32 object-cover rounded mt-2"
          />
        )}

       {/* Available toggle */}
<label className="flex items-center gap-2 mt-2">
  <input
    type="checkbox"
    name="isAvailable"
    checked={form.isAvailable}
    onChange={(e) =>
      setForm((prev) => ({ ...prev, isAvailable: e.target.checked }))
    }
  />
  <span>Currently available</span>
</label>



        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded w-full mt-3"
        >
          {loading ? "Adding..." : "Add Item"}
        </button>
      </form>
    </div>
  );
};

export default AddItem;
