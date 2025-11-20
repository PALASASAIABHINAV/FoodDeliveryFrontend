import React, { useEffect, useState } from "react";
import { useShopStore } from "../../store/useShopStore";
import { useUserStore } from "../../store/useAuthStore";
import { useNavigate } from "react-router-dom";
import Navbar from "../common/Navbar";
import { Store, MapPin, Image as ImageIcon } from "lucide-react";

const CreateShop = () => {
  const { createOrUpdateShop, loading } = useShopStore();
  const { detectedLocation, fetchUserLocation } = useUserStore();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    city: "",
    state: "",
    address: "",
    image: "",
  });

  // 🔹 Fetch user location on mount
  useEffect(() => {
    fetchUserLocation();
  }, [fetchUserLocation]);

  // 🔹 When location is available, prefill city/state/address
  useEffect(() => {
    if (detectedLocation) {
      setForm((prev) => ({
        ...prev,
        city: detectedLocation.city || "",
        state: detectedLocation.state || "",
        address: detectedLocation.address || "",
      }));
    }
  }, [detectedLocation]);

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
      alert("Shop created successfully!");
      navigate("/"); // back to OwnerDashboard
    } catch (err) {
      alert("Failed to create shop.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-10 flex items-start justify-center">
        <div className="w-full max-w-xl bg-white/95 border border-slate-100 rounded-2xl shadow-xl p-6 sm:p-7 relative overflow-hidden">
          {/* soft background blobs */}
          <div className="absolute -right-14 -top-14 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-10 bottom-0 w-36 h-36 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 flex items-center justify-center">
                <Store className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-emerald-500 font-semibold">
                  Owner setup
                </p>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                  Create your restaurant
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Add your restaurant details so customers can discover and
                  order from you on ZentroEat.
                </p>
              </div>
            </div>

            {/* Location hint */}
            {detectedLocation ? (
              <div className="mb-4 flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">
                <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <p className="text-[11px] text-emerald-900">
                  We pre-filled your city & address using your current
                  location. You can adjust them if needed.
                </p>
              </div>
            ) : (
              <div className="mb-4 text-[11px] text-slate-500">
                If location access was blocked, please fill in your city and
                address manually.
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Shop name */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Restaurant name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g. Zentro Biryani House"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  required
                />
              </div>

              {/* City + State */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    City <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    placeholder="City"
                    value={form.city}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    State <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="state"
                    placeholder="State"
                    value={form.state}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    required
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Full address <span className="text-rose-500">*</span>
                </label>
                <textarea
                  name="address"
                  placeholder="House/Shop no, street, area, landmark"
                  value={form.address}
                  onChange={handleChange}
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 resize-none"
                  required
                />
                <p className="mt-1 text-[11px] text-slate-400">
                  This address will be used by delivery partners to pick up
                  orders.
                </p>
              </div>

              {/* Image upload */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Restaurant cover image
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex-1 cursor-pointer">
                    <div className="w-full rounded-xl border border-dashed border-slate-300 bg-slate-50/60 px-3 py-3 flex items-center gap-3 hover:border-emerald-400 hover:bg-emerald-50/40 transition">
                      <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center shadow-sm border border-slate-100">
                        <ImageIcon className="w-5 h-5 text-slate-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-slate-800">
                          Upload restaurant photo
                        </p>
                        <p className="text-[11px] text-slate-500">
                          JPG, PNG up to ~2–3 MB
                        </p>
                      </div>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {form.image && (
                  <div className="mt-3 flex items-center gap-3">
                    <div className="w-20 h-20 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                      <img
                        src={form.image}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500">
                      This image will be shown to users in restaurant listings.
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="flex-1 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-full bg-emerald-500 px-4 py-2.5 text-xs font-semibold text-white hover:bg-emerald-600 shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? "Creating…" : "Create restaurant"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateShop;
