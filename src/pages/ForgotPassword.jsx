import React, { useState } from "react";
import axios from "axios";
import { serverUrl } from "../App";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1=email, 2=otp, 3=new password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // STEP 1 → Send OTP
  const handleStep1 = async () => {
    setError("");
    if (!email) {
      setError("Please enter your registered email.");
      return;
    }

    try {
      setLoading(true);
      const result = await axios.post(
        `${serverUrl}/api/auth/send-otp`,
        { email },
        { withCredentials: true }
      );
      console.log(result);
      setStep(2);
    } catch (error) {
      console.log(error);
      setError(
        error.response?.data?.message || "Failed to send OTP. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // STEP 2 → Verify OTP
  const handleStep2 = async () => {
    setError("");
    if (!otp) {
      setError("Please enter the OTP sent to your email.");
      return;
    }

    try {
      setLoading(true);
      const result = await axios.post(
        `${serverUrl}/api/auth/verify-otp`,
        { email, otp },
        { withCredentials: true }
      );
      console.log(result);
      setStep(3);
    } catch (error) {
      console.log(error);
      setError(
        error.response?.data?.message || "Invalid OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // STEP 3 → Reset Password
  const handleStep3 = async () => {
    setError("");
    if (!newPassword || !confirmPassword) {
      setError("Please enter and confirm your new password.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      const result = await axios.post(
        `${serverUrl}/api/auth/reset-password`,
        { email, newPassword },
        { withCredentials: true }
      );
      console.log(result);
      navigate("/signin");
    } catch (error) {
      console.log(error);
      setError(
        error.response?.data?.message || "Failed to reset password."
      );
    } finally {
      setLoading(false);
    }
  };

  const getStepTitle = () => {
    if (step === 1) return "Forgot Password";
    if (step === 2) return "Verify OTP";
    return "Set New Password";
  };

  const getStepSubtitle = () => {
    if (step === 1)
      return "Enter your registered email address to receive an OTP.";
    if (step === 2)
      return "Enter the OTP sent to your email to verify your identity.";
    return "Create a strong new password for your ZentroEat account.";
  };

  return (
    <div className="w-screen h-screen overflow-hidden flex items-center justify-center relative bg-gradient-to-br from-teal-50 via-emerald-50 to-slate-50">
      {/* Background shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-72 h-72 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob"></div>
        <div className="absolute -bottom-32 -left-32 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000"></div>
      </div>

      {/* Card */}
      <div className="relative z-10 w-[90%] max-w-[460px] bg-white/85 backdrop-blur-2xl rounded-3xl shadow-[0_20px_60px_rgba(15,23,42,0.15)] border border-white/60 p-8">
        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg flex items-center justify-center bg-slate-900/90">
            <img
              src="/zentroeat.png"
              alt="ZentroEat logo"
              className="w-14 h-14 object-contain"
            />
          </div>
          <h1 className="mt-3 text-2xl font-extrabold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-500 bg-clip-text text-transparent tracking-tight">
            ZentroEat
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Fast, fresh & tracked in real-time
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-4 text-[11px] font-medium text-slate-500">
          <span className={step >= 1 ? "text-emerald-600" : ""}>1. Email</span>
          <span className="text-slate-400">›</span>
          <span className={step >= 2 ? "text-emerald-600" : ""}>2. OTP</span>
          <span className="text-slate-400">›</span>
          <span className={step === 3 ? "text-emerald-600" : ""}>
            3. New Password
          </span>
        </div>

        <div className="text-center mb-4">
          <h3 className="text-xl font-bold text-slate-900">
            {getStepTitle()}
          </h3>
          <p className="text-slate-600 text-sm mt-1">{getStepSubtitle()}</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50/90 border border-red-200 rounded-xl text-xs text-red-700 flex gap-2 items-start animate-slideIn">
            <span className="mt-[2px]">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Step content */}
        <div className="space-y-4">
          {step === 1 && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Registered Email
                </label>
                <input
                  type="email"
                  placeholder="Enter your registered email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 transition text-sm"
                />
              </div>
              <button
                onClick={handleStep1}
                disabled={loading}
                className="w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white font-semibold py-2.5 rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:brightness-105 transition disabled:opacity-70 disabled:cursor-not-allowed text-sm"
              >
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Enter OTP
                </label>
                <input
                  type="text"
                  placeholder="Enter OTP sent to your email"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 transition text-sm tracking-widest font-mono"
                />
              </div>
              <button
                onClick={handleStep2}
                disabled={loading}
                className="w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white font-semibold py-2.5 rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:brightness-105 transition disabled:opacity-70 disabled:cursor-not-allowed text-sm"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
              <button
                onClick={() => setStep(1)}
                className="w-full text-xs text-slate-500 hover:text-slate-700 mt-1"
              >
                ← Change email
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 transition text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 transition text-sm"
                />
              </div>
              <button
                onClick={handleStep3}
                disabled={loading}
                className="w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white font-semibold py-2.5 rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:brightness-105 transition disabled:opacity-70 disabled:cursor-not-allowed text-sm"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-[11px] text-slate-600 mt-4">
          Remembered your password?{" "}
          <button
            onClick={() => navigate("/signin")}
            className="text-emerald-600 font-semibold hover:text-emerald-700"
          >
            Go back to Sign In
          </button>
        </p>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes blob {
          0%,100% { transform: translate(0,0) scale(1); }
          25% { transform: translate(18px,-32px) scale(1.08); }
          50% { transform: translate(-22px,18px) scale(0.96); }
          75% { transform: translate(32px,32px) scale(1.04); }
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

export default ForgotPassword;
