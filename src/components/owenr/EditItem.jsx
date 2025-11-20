// src/pages/Owner/EditItem.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useItemStore } from "../../store/useItemStore";
import axios from "axios";
import { serverUrl } from "../../App";
import Navbar from "../common/Navbar";
import {
  UtensilsCrossed,
  IndianRupee,
  ImagePlus,
  CheckCircle2,
} from "lucide-react";

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
    reader.onloadend = () =>
      setForm((prev) => ({ ...prev, image: reader.result }));
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

  const previewImage = form.image || existingImage;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-10">
        {/* Header */}
        <header className="mb-6 flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-emerald-500 font-semibold">
              Owner • Menu
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 flex items-center gap-2">
              Edit item
              <span className="inline-flex items-center justify-center rounded-full bg-amber-50 text-amber-600 text-[10px] font-semibold px-2 py-0.5 border border-amber-100">
                Update live dish
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Modify price, availability or details for this dish. Changes
              reflect instantly on ZentroEat.
            </p>
          </div>
        </header>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Top row: basic info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Item name
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <UtensilsCrossed className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    name="name"
                    placeholder="e.g. Paneer Butter Masala"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100 transition"
                    required
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Category
                </label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-sm text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100 transition"
                  required
                >
                  <option value="">Select category</option>
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
              </div>
            </div>

            {/* Price + Food type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Price */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Price
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500">
                    <IndianRupee className="w-4 h-4" />
                  </span>
                  <input
                    type="number"
                    name="price"
                    placeholder="e.g. 180"
                    value={form.price}
                    onChange={handleChange}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100 transition"
                    required
                    min="0"
                  />
                </div>
              </div>

              {/* Food type – pill toggle */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Food type
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({ ...prev, foodType: "Veg" }))
                    }
                    className={`flex-1 inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                      form.foodType === "Veg"
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    Veg
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({ ...prev, foodType: "Non-Veg" }))
                    }
                    className={`flex-1 inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                      form.foodType === "Non-Veg"
                        ? "border-rose-500 bg-rose-50 text-rose-700"
                        : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    Non-Veg
                  </button>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Description <span className="text-slate-400">(optional)</span>
              </label>
              <textarea
                name="description"
                placeholder="Describe taste, portion size or special ingredients…"
                value={form.description}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100 transition resize-none"
              />
            </div>

            {/* Image upload + preview */}
            <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] gap-4 items-start">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Item image
                </label>
                <label className="flex items-center justify-between gap-3 w-full px-3 py-2.5 rounded-xl border border-dashed border-slate-300 bg-slate-50/60 text-xs text-slate-600 cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/40 transition">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                      <ImagePlus className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">
                        Change dish photo
                      </p>
                      <p className="text-[10px] text-slate-500">
                        Leave empty to keep existing image
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-600">
                    Upload
                  </span>
                  <input
                    type="file"
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </label>
              </div>

              {/* Preview */}
              <div className="sm:mt-0 mt-2">
                <p className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Current preview
                </p>
                <div className="w-full h-28 rounded-xl border border-slate-200 bg-slate-100 flex items-center justify-center overflow-hidden">
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-[11px] text-slate-400">
                      No image available
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Availability toggle */}
            <div className="flex items-center justify-between gap-3 border border-slate-100 rounded-xl bg-slate-50/80 px-3.5 py-2.5">
              <div>
                <p className="text-xs font-semibold text-slate-800">
                  Currently available
                </p>
                <p className="text-[11px] text-slate-500">
                  Turn off if this dish is temporarily not being served.
                </p>
              </div>
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <div
                  className={`w-10 h-5 flex items-center rounded-full p-0.5 transition ${
                    form.isAvailable ? "bg-emerald-500" : "bg-slate-300"
                  }`}
                >
                  <div
                    className={`h-4 w-4 rounded-full bg-white shadow transform transition ${
                      form.isAvailable ? "translate-x-5" : ""
                    }`}
                  />
                </div>
                <input
                  type="checkbox"
                  name="isAvailable"
                  checked={form.isAvailable}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      isAvailable: e.target.checked,
                    }))
                  }
                  className="hidden"
                />
                <span className="text-[11px] font-medium text-slate-700">
                  {form.isAvailable ? "Available" : "Not available"}
                </span>
              </label>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row sm:justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-flex items-center justify-center px-4 py-2.5 rounded-full border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-amber-500 text-xs font-semibold text-white shadow-md hover:bg-amber-600 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <CheckCircle2 className="w-4 h-4" />
                {loading ? "Updating item…" : "Save changes"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default EditItem;
