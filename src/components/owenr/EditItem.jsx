import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useItemStore } from "../../store/useItemStore";
import axios from "axios";
import { serverUrl } from "../../App";

const EditItem = () => {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const { editItem, loading } = useItemStore();

  const [form, setForm] = useState({
    name: "",
    category: "",
    price: "",
    foodType: "Veg",
    description: "",
    image: "",
    isAvailable: true,  
  });

  const [existingImage, setExistingImage] = useState("");

  // 🟢 Fetch item details on mount
  useEffect(() => {
    const fetchItem = async () => {
      try {
        const res = await axios.get(`${serverUrl}/api/item/${itemId}`, {
          withCredentials: true,
        });
        const item = res.data.item;
        setForm({
          name: item.name || "",
          category: item.category || "",
          price: item.price || "",
          foodType: item.foodType || "Veg",
          description: item.description || "",
          image: item.image?.url || "",
          isAvailable: item.isAvailable ?? true, 
        });
        setExistingImage(item.image?.url || "");
      } catch (error) {
        console.error("❌ Failed to fetch item:", error);
        alert("Failed to fetch item details");
        navigate("/");
      }
    };
    fetchItem();
  }, [itemId, navigate]);

  // 🟡 Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // 🟣 Handle image upload (convert to base64)
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setForm((prev) => ({ ...prev, image: reader.result }));
    reader.readAsDataURL(file);
  };

  // 🟠 Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await editItem(itemId, form);
      alert("✅ Item updated successfully!");
      navigate("/");
    } catch (err) {
      alert("❌ Failed to update item.");
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 border rounded-lg shadow bg-white">
      <h2 className="text-2xl font-semibold mb-4 text-center">Edit Item</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <input
          type="text"
          name="name"
          placeholder="Item Name"
          value={form.name}
          onChange={handleChange}
          className="border p-2 w-full rounded"
          required
        />

        {/* Category */}
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

        {/* Price */}
        <input
          type="number"
          name="price"
          placeholder="Price"
          value={form.price}
          onChange={handleChange}
          className="border p-2 w-full rounded"
          required
        />

        {/* Food Type */}
        <select
          name="foodType"
          value={form.foodType}
          onChange={handleChange}
          className="border p-2 w-full rounded"
        >
          <option value="Veg">Veg</option>
          <option value="Non-Veg">Non-Veg</option>
        </select>

        {/* Description */}
        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          className="border p-2 w-full rounded"
          rows="3"
        />

        {/* Image Upload */}
        <div>
          <input
            type="file"
            onChange={handleImageUpload}
            className="border p-2 w-full rounded"
            accept="image/*"
          />

          {(form.image || existingImage) && (
            <img
              src={form.image || existingImage}
              alt="Preview"
              className="w-32 h-32 object-cover rounded mt-2"
            />
          )}
        </div>

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
          className="bg-yellow-600 text-white px-4 py-2 rounded w-full mt-3"
        >
          {loading ? "Updating..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
};

export default EditItem;
