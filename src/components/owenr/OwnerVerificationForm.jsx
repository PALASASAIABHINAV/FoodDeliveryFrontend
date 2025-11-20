// src/components/owenr/OwnerVerificationForm.jsx
import React, { useState } from "react";
import { useOwnerVerificationStore } from "../../store/useOwnerVerificationStore";
import { useUserStore } from "../../store/useAuthStore";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, FileText, Phone, MapPin, Loader2 } from "lucide-react";

const OwnerVerificationForm = () => {
  const { user } = useUserStore();
  const { submitRequest, loading } = useOwnerVerificationStore();
  const navigate = useNavigate();

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

    // ✅ mark as pending (very important)
    if (typeof window !== "undefined") {
      localStorage.setItem("zentro_owner_request_status", "PENDING");
    }

        alert("Request submitted to admin. Please wait for approval.");
    navigate("/"); // ✅ go to waiting page

  } catch (err) {
    alert(err.response?.data?.message || "Failed to submit request");
  }
};


  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-10">
      <div className="max-w-3xl w-full grid grid-cols-1 md:grid-cols-[1.1fr_0.9fr] gap-6">
        {/* LEFT – Form */}
        <div className="bg-white shadow-xl rounded-2xl p-6 sm:p-7 border border-slate-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                Become a ZentroEat Partner
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Submit your restaurant details for verification. Our team will
                review and activate your owner account.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Restaurant name <span className="text-rose-500">*</span>
              </label>
              <input
                name="shopName"
                value={form.shopName}
                onChange={handleChange}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400"
                placeholder="e.g., Spice Route Kitchen"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Full address <span className="text-rose-500">*</span>
              </label>
              <textarea
                name="shopAddress"
                value={form.shopAddress}
                onChange={handleChange}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400"
                rows={2}
                placeholder="Door no, street, area, landmark"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  City <span className="text-rose-500">*</span>
                </label>
                <input
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400"
                  placeholder="Hyderabad"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  State <span className="text-rose-500">*</span>
                </label>
                <input
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400"
                  placeholder="Telangana"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  FSSAI / License number
                </label>
                <input
                  name="licenseNumber"
                  value={form.licenseNumber}
                  onChange={handleChange}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400"
                  placeholder="Optional but recommended"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Contact phone <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className="w-full border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400"
                    placeholder="Owner mobile number"
                    required
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Description / notes for admin
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400"
                rows={2}
                placeholder="Mention cuisine type, outlets, special notes etc."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Upload license / document (image or PDF)
              </label>
              <div className="flex flex-col gap-2">
                <label className="flex items-center justify-between border-2 border-dashed border-slate-200 rounded-lg px-3 py-3 cursor-pointer hover:border-emerald-300 transition">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-800">
                        Click to upload file
                      </p>
                      <p className="text-[11px] text-slate-500">
                        JPEG, PNG or PDF up to ~5 MB
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Browse files
                  </span>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>

                {filePreview && filePreview.startsWith("data:image") && (
                  <img
                    src={filePreview}
                    alt="Preview"
                    className="mt-1 w-32 h-32 object-cover rounded-lg border border-slate-200"
                  />
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 rounded-lg font-semibold text-sm shadow-md flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "Submitting request…" : "Submit for approval"}
            </button>
          </form>

          <p className="text-[11px] text-slate-400 text-center mt-3">
            Once approved, you&apos;ll be able to create your restaurant and
            start accepting orders on ZentroEat.
          </p>
        </div>

        {/* RIGHT – Info panel */}
        <div className="hidden md:flex flex-col bg-slate-900 text-slate-50 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="absolute -left-16 bottom-0 w-40 h-40 bg-emerald-400/10 rounded-full blur-3xl" />

          <div className="relative z-10">
            <p className="text-[11px] uppercase tracking-[0.2em] text-emerald-300 font-semibold mb-2">
              Partner with ZentroEat
            </p>
            <h3 className="text-xl font-bold mb-3">
              Grow your restaurant with online orders
            </h3>
            <p className="text-xs text-slate-300 mb-6">
              Verified partners get access to our customer base, live order
              tracking and dedicated support team.
            </p>

            <div className="space-y-4 text-xs">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <p className="font-semibold text-slate-50">
                    Secure verification
                  </p>
                  <p className="text-slate-400 text-[11px]">
                    Your documents are reviewed only by our internal onboarding
                    team.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <p className="font-semibold text-slate-50">
                    ZentroEat 
                  </p>
                  <p className="text-slate-400 text-[11px]">
                    Vaddeswaram, Vijayawada – 522502, Andra Pradesh, India
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <p className="font-semibold text-slate-50">
                    Onboarding support
                  </p>
                  <p className="text-slate-400 text-[11px]">
                    Email: 23000333365cseele@gmial.com
                    <br />
                    Phone: +91-9502551724
                  </p>
                </div>
              </div>
            </div>

           
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerVerificationForm;
