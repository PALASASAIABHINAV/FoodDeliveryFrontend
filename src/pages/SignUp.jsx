// src/components/auth/SignUp.jsx
import React, { useState } from "react";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../firebase";
import { serverUrl } from "../App";
import axios from "axios";
import { useUserStore } from "../store/useAuthStore";
import { useNavigate } from "react-router-dom";

const SignUp = () => {
  // Use a single formData object
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    mobile: "",
    role: "user",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState("");

  const { fetchCurrentUser } = useUserStore();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((s) => ({ ...s, [e.target.name]: e.target.value }));
    setError("");
  };

  // ✅ Original signup flow (unchanged logic)
  const handleSignUp = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    if (!formData.mobile || formData.mobile.length < 10) {
      setError("Please enter a valid mobile number (at least 10 digits).");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const result = await axios.post(
        `${serverUrl}/api/auth/signup`,
        {
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          mobile: formData.mobile,
          role: formData.role,
        },
        { withCredentials: true }
      );

      console.log("Signup success:", result.data);
      await fetchCurrentUser();
      navigate("/");
    } catch (err) {
      console.error("Error while signup:", err);
      setError(err.response?.data?.message || "Sign up failed");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Original Google signup logic (unchanged)
  const handleGoogleSignUp = async () => {
    if (!formData.mobile) {
      setError("Please enter your mobile number before signing up with Google");
      return;
    }

    if (formData.mobile.length < 10) {
      setError("Please enter a valid mobile number (at least 10 digits)");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      const { data } = await axios.post(
        `${serverUrl}/api/auth/google-auth`,
        {
          fullName: result.user.displayName,
          email: result.user.email,
          mobile: formData.mobile,
          role: formData.role,
          isSignUp: true,
        },
        { withCredentials: true }
      );

      console.log("Google signup success:", data);
      await fetchCurrentUser();
      navigate("/");
    } catch (err) {
      console.error("Error while Google signup:", err);

      if (err.response?.data?.needsSignIn) {
        alert(
          "⚠️ Account already exists!\n\nPlease sign in instead of signing up."
        );
        navigate("/signin");
      } else {
        setError(err.response?.data?.message || "Google sign up failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-emerald-50 to-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* background shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 w-full max-w-5xl flex items-center justify-between gap-6">
        {/* left branding – now ZentroEat */}
        <div className="hidden lg:flex flex-col justify-center flex-1 text-slate-900 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl overflow-hidden flex items-center justify-center shadow-xl bg-slate-900/90">
              <img
                src="/zentroeat.png"
                alt="ZentroEat logo"
                className="w-12 h-12 object-contain"
              />
            </div>
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-500 bg-clip-text text-transparent tracking-tight">
              ZentroEat
            </h1>
          </div>

          <h2 className="text-4xl font-bold leading-tight text-slate-900">
            Your favourite meals,
            <br />
            <span className="bg-gradient-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent">
              delivered fast & fresh
            </span>
          </h2>

          <p className="text-lg text-slate-600">
            Live tracking • Trusted restaurants • Secure payments
          </p>
        </div>

        {/* form section */}
        <div className="w-full lg:w-[420px]">
          <div className="bg-white/85 backdrop-blur-2xl rounded-2xl shadow-[0_20px_60px_rgba(15,23,42,0.18)] p-6 border border-white/60">
            <div className="text-center mb-4">
              <h3 className="text-2xl font-bold text-slate-900">
                Create account
              </h3>
              <p className="text-slate-600 text-sm">
                Join ZentroEat and start ordering in minutes
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50/90 border border-red-200 rounded-xl text-xs text-red-700 animate-slideIn">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSignUp} className="space-y-3">
              {/* Full Name */}
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Full name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 transition text-sm"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Email address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 transition text-sm"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create password"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 transition text-sm pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm"
                  >
                    👁️
                  </button>
                </div>
              </div>

              {/* Mobile */}
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Mobile number{" "}
                  <span className="text-emerald-600 font-semibold">*</span>
                </label>
                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  placeholder="10-digit mobile number"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 transition text-sm"
                  required
                />
              </div>

              {/* Role */}
              <div>
                <label className="text-sm font-medium text-slate-700">
                  I want to
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 transition text-sm cursor-pointer"
                >
                  <option value="user">Order food</option>
                  <option value="owner">List my restaurant</option>
                  <option value="deliveryBoy">Become a delivery partner</option>
                </select>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white font-semibold py-3 rounded-xl hover:brightness-105 hover:shadow-lg shadow-emerald-500/25 transition disabled:opacity-70 disabled:cursor-not-allowed text-sm"
              >
                {loading ? "Creating..." : "Create account"}
              </button>

              {/* Divider */}
              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-[11px]">
                  <span className="px-2 bg-white/90 text-slate-500 rounded-full border border-slate-100">
                    or
                  </span>
                </div>
              </div>

              {/* Google */}
              <button
                type="button"
                onClick={handleGoogleSignUp}
                disabled={loading}
                className="w-full bg-white/90 border border-slate-200 py-2.5 rounded-xl flex items-center justify-center gap-2 hover:border-slate-300 hover:shadow-md transition text-sm"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="text-slate-700 font-medium">
                  Continue with Google
                </span>
              </button>
            </form>

            <p className="text-center text-sm text-slate-600 mt-4">
              Already have an account?{" "}
              <a
                href="/signin"
                className="text-emerald-600 font-semibold hover:text-emerald-700"
              >
                Sign in
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* animations */}
      <style>{`
        @keyframes blob {
          0%,100% { transform: translate(0,0) scale(1); }
          25% { transform: translate(20px,-40px) scale(1.1); }
          50% { transform: translate(-20px,20px) scale(0.9); }
          75% { transform: translate(40px,40px) scale(1.05); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideIn { animation: slideIn .3s ease-out; }
      `}</style>
    </div>
  );
};

export default SignUp;
