import React, { useState } from "react";
import { useOwnerVerificationStore } from "../../store/useOwnerVerificationStore";
import { useUserStore } from "../../store/useAuthStore";

const OwnerVerificationForm = () => {
  const { user } = useUserStore();
  const { submitRequest, loading } = useOwnerVerificationStore();

  const [form, setForm] = useState({
    shopName: "",
    shopAddress: "",
    city: "",
    state: "",
    licenseNumber: "",
    description: "",
    phone: user?.mobile || "",
  });

  const [filePreview, setFilePreview] = useState(null);
  const [fileBase64, setFileBase64] = useState(null);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setFileBase64(reader.result);
      setFilePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await submitRequest({
        ...form,
        licenseDocBase64: fileBase64,
      });
      alert("Request submitted to admin. Please wait for approval.");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit request");
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4">
      <div className="max-w-xl w-full bg-white shadow-lg rounded-2xl p-6 space-y-4">
        <h2 className="text-2xl font-bold text-center mb-2">
          Owner Verification
        </h2>
        <p className="text-gray-600 text-center text-sm mb-4">
          Submit your shop details & license so admin can verify your account.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Shop Name*</label>
            <input
              name="shopName"
              value={form.shopName}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Shop Address*
            </label>
            <textarea
              name="shopAddress"
              value={form.shopAddress}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
              rows={2}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">City*</label>
              <input
                name="city"
                value={form.city}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">State*</label>
              <input
                name="state"
                value={form.state}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">
                License Number
              </label>
              <input
                name="licenseNumber"
                value={form.licenseNumber}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Contact Phone*
              </label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Description / Notes
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Upload License / Document (image or PDF)
            </label>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileChange}
              className="w-full"
            />
            {filePreview && filePreview.startsWith("data:image") && (
              <img
                src={filePreview}
                alt="Preview"
                className="mt-2 w-40 h-40 object-cover rounded-lg border"
              />
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit for Approval"}
          </button>
        </form>

        <p className="text-xs text-gray-500 text-center">
          Admin will review your request and contact you using your phone/email.
        </p>
      </div>
    </div>
  );
};

export default OwnerVerificationForm;
