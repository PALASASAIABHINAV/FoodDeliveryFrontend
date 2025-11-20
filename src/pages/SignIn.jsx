import React, { useState } from "react";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../firebase";
import { serverUrl } from "../App";
import axios from "axios";
import { useUserStore } from "../store/useAuthStore";
import { useNavigate } from "react-router-dom";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login, fetchCurrentUser } = useUserStore();
  const navigate = useNavigate();

  const handleSignIn = async () => {
    setError("");
    setLoading(true);

    try {
      const result = await login(email, password);
      console.log("Login success:", result);
      await fetchCurrentUser();
      navigate("/");
    } catch (error) {
      console.log("Error while signin:", error);
      setError(error.response?.data?.message || "Sign in failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      await axios.post(
        `${serverUrl}/api/auth/google-auth`,
        {
          email: result.user.email,
          fullName: result.user.displayName,
          mobile: "",
          role: "user",
          isSignUp: false,
        },
        { withCredentials: true }
      );

      await fetchCurrentUser();
      navigate("/");
    } catch (error) {
      if (error.response?.data?.needsSignUp) {
        alert("⚠️ No account found!\nPlease sign up first.");
        navigate("/signup");
      } else {
        setError(error.response?.data?.message || "Google sign in failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-screen h-screen overflow-hidden flex items-center justify-center relative bg-gradient-to-br from-teal-50 via-emerald-50 to-slate-50">
      {/* Background animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob"></div>
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/3 w-72 h-72 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-4000"></div>
      </div>

      {/* Card */}
      <div className="relative z-10 w-[90%] max-w-[440px] bg-white/85 backdrop-blur-2xl border border-white/60 shadow-[0_22px_70px_rgba(15,23,42,0.2)] rounded-3xl p-8">
        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-xl flex items-center justify-center bg-slate-900/90">
            <img
              src="/zentroeat.png"
              alt="ZentroEat logo"
              className="w-14 h-14 object-contain"
            />
          </div>
          <h1 className="text-3xl font-extrabold mt-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-500 bg-clip-text text-transparent tracking-tight">
            ZentroEat
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Your city’s fastest food delivery
          </p>
        </div>

        <h2 className="text-center text-2xl font-bold text-slate-900 mb-1">
          Welcome back
        </h2>
        <p className="text-center text-slate-600 mb-6 text-sm">
          Sign in to track orders, reorder favourites & enjoy live delivery.
        </p>

        {error && (
          <div className="mb-5 p-3 bg-red-50/90 border border-red-200 rounded-xl animate-slideIn">
            <p className="text-xs text-red-700 flex gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </p>
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSignIn();
          }}
          className="space-y-4"
        >
          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700">
              Email
            </label>
            <input
              type="email"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm hover:border-slate-300 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 transition"
              placeholder="you@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Password + Show toggle */}
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700">
              Password
            </label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm hover:border-slate-300 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 transition pr-11"
                placeholder="Enter your password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-lg"
              >
                {showPass ? "🙈" : "👁️"}
              </button>
            </div>

            <div className="mt-2 text-right">
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Forgot password?
              </button>
            </div>
          </div>

          {/* Login button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 text-white font-semibold py-3 rounded-xl shadow-xl shadow-emerald-500/25 transition-all disabled:opacity-70 disabled:cursor-not-allowed text-sm"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

          {/* OR */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white/90 px-3 text-[11px] text-slate-500 rounded-full border border-slate-100">
                or continue with
              </span>
            </div>
          </div>

          {/* Google Login */}
          <button
            type="button"
            disabled={loading}
            onClick={handleGoogleSignIn}
            className="w-full bg-white/90 border border-slate-200 hover:border-slate-300 hover:shadow-md py-2.5 rounded-xl flex items-center justify-center gap-3 transition-all text-sm"
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
            <span className="font-medium text-slate-700">
              Sign in with Google
            </span>
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-slate-600 mt-6">
          Don&apos;t have an account?{" "}
          <button
            type="button"
            onClick={() => navigate("/signup")}
            className="text-emerald-600 font-semibold hover:text-emerald-700"
          >
            Sign Up
          </button>
        </p>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -40px) scale(1.08); }
          50% { transform: translate(-24px, 24px) scale(0.95); }
          75% { transform: translate(36px, 32px) scale(1.03); }
        }
        .animate-blob { animation: blob 8s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }

        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideIn { animation: slideIn .25s ease-out; }
      `}</style>
    </div>
  );
};

export default SignIn;
