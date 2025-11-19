// src/components/auth/SignUp.jsx
import React, { useState } from "react";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../firebase";
import { serverUrl } from "../App";
import axios from "axios";
import { useUserStore } from "../store/useAuthStore";
import { useNavigate } from "react-router-dom";

const SignUp = () => {
  // Use a single formData object (keeps fields compact like your friend component)
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

  // Your original signup flow (preserved)
  const handleSignUp = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    // Basic mobile validation — preserved from your logic
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
      // preserve behavior: fetch current user and redirect
      await fetchCurrentUser();
      navigate("/");
    } catch (err) {
      console.error("Error while signup:", err);
      setError(err.response?.data?.message || "Sign up failed");
    } finally {
      setLoading(false);
    }
  };

  // Your Google signup logic — preserved, with mobile validation and redirect
  const handleGoogleSignUp = async () => {
    // validate mobile before Google signup (your requirement)
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

      // Send isSignUp: true to backend so it knows this is a signup flow
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

      // preserve your original behavior that checks for backend hints
      if (err.response?.data?.needsSignIn) {
        alert("⚠️ Account already exists!\n\nPlease sign in instead of signing up.");
        navigate("/signin");
      } else {
        setError(err.response?.data?.message || "Google sign up failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 flex items-center justify-center p-4 relative overflow-hidden">

    {/* background shapes - same */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute -top-32 -right-32 w-64 h-64 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-amber-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-rose-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
    </div>

    <div className="relative z-10 w-full max-w-5xl flex items-center justify-between gap-6">

      {/* left branding - same but compact */}
      <div className="hidden lg:flex flex-col justify-center flex-1 text-gray-800 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-rose-400 rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-2xl">🍽️</span>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-rose-600 bg-clip-text text-transparent">
            FoodHub
          </h1>
        </div>

        <h2 className="text-4xl font-bold leading-tight text-gray-900">
          Your favorite meals,
          <br />
          <span className="bg-gradient-to-r from-orange-500 to-rose-500 bg-clip-text text-transparent">
            delivered fresh
          </span>
        </h2>

        <p className="text-lg text-gray-600">
          Fast delivery • Best restaurants • Secure payments
        </p>
      </div>

      {/* form section */}
      <div className="w-full lg:w-[420px]">
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/30">

          <div className="text-center mb-4">
            <h3 className="text-2xl font-bold text-gray-900">Create Account</h3>
            <p className="text-gray-600 text-sm">Join and enjoy the best food</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-400 rounded-lg text-sm text-red-700 animate-slideIn">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSignUp} className="space-y-3">

            {/* Full Name */}
            <div>
              <label className="text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="w-full px-3 py-2.5 bg-gray-50 border rounded-lg outline-none focus:border-orange-400 transition"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="text-sm font-medium text-gray-700">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                className="w-full px-3 py-2.5 bg-gray-50 border rounded-lg outline-none focus:border-orange-400 transition"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create password"
                  className="w-full px-3 py-2.5 bg-gray-50 border rounded-lg outline-none focus:border-orange-400 transition pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  👁️
                </button>
              </div>
            </div>

            {/* Mobile */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Mobile Number <span className="text-orange-500">*</span>
              </label>
              <input
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                placeholder="10-digit mobile number"
                className="w-full px-3 py-2.5 bg-gray-50 border rounded-lg outline-none focus:border-orange-400 transition"
                required
              />
            </div>

            {/* Role */}
            <div>
              <label className="text-sm font-medium text-gray-700">I want to</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-3 py-2.5 bg-gray-50 border rounded-lg outline-none focus:border-orange-400 cursor-pointer"
              >
                <option value="user">Order Food</option>
                <option value="owner">List My Restaurant</option>
                <option value="deliveryBoy">Become a Delivery Partner</option>
              </select>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 to-rose-500 text-white font-semibold py-3 rounded-lg hover:shadow-md transition"
            >
              {loading ? "Creating..." : "Create Account"}
            </button>

            {/* Divider */}
            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-white text-gray-500">or</span>
              </div>
            </div>

            {/* Google */}
            <button
              type="button"
              onClick={handleGoogleSignUp}
              disabled={loading}
              className="w-full bg-white border py-3 rounded-lg flex items-center justify-center gap-2 hover:shadow-sm transition"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>Continue with Google
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-4">
            Already have an account?{" "}
            <a href="/signin" className="text-orange-500 font-semibold">Sign In</a>
          </p>
        </div>
      </div>
    </div>

    {/* animations same */}
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
      .animate-slideIn { animation: slideIn .3s ease-out; }
    `}</style>
  </div>
  );
};

export default SignUp;
