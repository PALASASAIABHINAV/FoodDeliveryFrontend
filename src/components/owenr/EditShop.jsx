// src/pages/Owner/EditShop.jsx
import React, { useEffect, useState } from "react";
import { useShopStore } from "../../store/useShopStore";
import { useNavigate } from "react-router-dom";
import Navbar from "../common/Navbar";
import { Building2, MapPin, MapPinned, Home, ImagePlus, ArrowLeft } from "lucide-react";

const EditShop = () => {
  const { shop, createOrUpdateShop, fetchMyShop, loading } = useShopStore();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    city: "",
    state: "",
    address: "",
    image: "",
  });

  // Fetch existing shop on mount
  useEffect(() => {
    fetchMyShop();
  }, [fetchMyShop]);

  // Prefill when shop data is ready
  useEffect(() => {
    if (shop) {
      setForm({
        name: shop.name || "",
        city: shop.city || "",
        state: shop.state || "",
        address: shop.address || "",
        image: shop.image?.url || "",
      });
    }
  }, [shop]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () =>
      setForm((prev) => ({ ...prev, image: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createOrUpdateShop(form);
      alert("Shop updated successfully!");
      navigate("/");
    } catch (err) {
      alert("Failed to update shop.");
    }
  };

  if (loading && !shop) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-sm text-slate-600 font-medium">Loading your shop…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-10">
        {/* Header */}
        <header className="flex items-center justify-between gap-3 mb-6">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-emerald-500 font-semibold">
              Owner • Storefront
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 flex items-center gap-2">
              Edit your shop
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Keep your shop details updated so customers can easily find and trust you.
            </p>
          </div>

          <button
            onClick={() => navigate(-1)}
            className="hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-full border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </header>

        {/* Content Card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1.1fr)] gap-6">
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Shop Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Shop name
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Building2 className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g. ZentroEat Kitchen, Sai Tiffins"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100 transition"
                  required
                />
              </div>
            </div>

            {/* City + State */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  City
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <MapPin className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    name="city"
                    placeholder="e.g. Hyderabad"
                    value={form.city}
                    onChange={handleChange}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100 transition"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  State
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <MapPinned className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    name="state"
                    placeholder="e.g. Telangana"
                    value={form.state}
                    onChange={handleChange}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100 transition"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Full address
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400">
                  <Home className="w-4 h-4" />
                </span>
                <textarea
                  name="address"
                  placeholder="Door no, street, landmark…"
                  value={form.address}
                  onChange={handleChange}
                  rows="3"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100 transition resize-none"
                  required
                />
              </div>
            </div>

            {/* Image upload */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Shop cover image
              </label>
              <label className="flex items-center justify-between gap-3 w-full px-3 py-2.5 rounded-xl border border-dashed border-slate-300 bg-slate-50/60 text-xs text-slate-600 cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/40 transition">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <ImagePlus className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">
                      Upload / change shop photo
                    </p>
                    <p className="text-[10px] text-slate-500">
                      JPG, PNG – leave empty to keep existing image
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-emerald-600">
                  Browse
                </span>
                <input
                  type="file"
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
              </label>
            </div>

            {/* Buttons */}
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
                className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-emerald-500 text-xs font-semibold text-white shadow-md hover:bg-emerald-600 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Saving changes…" : "Save changes"}
              </button>
            </div>
          </form>

          {/* Preview Panel */}
          <aside className="bg-slate-50 rounded-2xl border border-slate-100 p-4 sm:p-5 flex flex-col gap-3">
            <p className="text-xs font-semibold text-slate-700 mb-1">
              Live preview
            </p>
            <div className="w-full aspect-[4/3] rounded-xl overflow-hidden bg-slate-200 flex items-center justify-center border border-slate-200">
              {form.image ? (
                <img
                  src={form.image}
                  alt="Shop preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-[11px] text-slate-500">
                  Shop image will appear here
                </span>
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 truncate">
                {form.name || "Your shop name"}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                {form.city || "City"}, {form.state || "State"}
              </p>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                {form.address || "Full address preview will be shown here."}
              </p>
            </div>
            <p className="mt-1 text-[10px] text-slate-400">
              This is how your shop card looks to customers on ZentroEat.
            </p>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default EditShop;
