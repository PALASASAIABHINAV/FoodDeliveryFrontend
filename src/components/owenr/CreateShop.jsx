import React, { useEffect, useState } from "react";
import { useShopStore } from "../../store/useShopStore";
import { useUserStore } from "../../store/useAuthStore";
import { useNavigate } from "react-router-dom";

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
  }, []);

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
      navigate("/");
    } catch (err) {
      alert("Failed to create shop.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded-lg shadow bg-white">
      <h2 className="text-xl font-semibold mb-4">Create Your Shop</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          name="name"
          placeholder="Shop Name"
          value={form.name}
          onChange={handleChange}
          className="border p-2 w-full rounded"
          required
        />

        <input
          type="text"
          name="city"
          placeholder="City"
          value={form.city}
          onChange={handleChange}
          className="border p-2 w-full rounded"
          required
        />

        <input
          type="text"
          name="state"
          placeholder="State"
          value={form.state}
          onChange={handleChange}
          className="border p-2 w-full rounded"
          required
        />

        <input
          type="text"
          name="address"
          placeholder="Address"
          value={form.address}
          onChange={handleChange}
          className="border p-2 w-full rounded"
          required
        />

        <input
          type="file"
          onChange={handleImageUpload}
          className="border p-2 w-full rounded"
        />

        {form.image && (
          <img
            src={form.image}
            alt="Preview"
            className="w-32 h-32 object-cover rounded mt-2"
          />
        )}

        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded w-full mt-3"
        >
          {loading ? "Creating..." : "Create Shop"}
        </button>
      </form>
    </div>
  );
};

export default CreateShop;
