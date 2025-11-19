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
  const navigate = useNavigate();

  // STEP 1 → Send OTP
  const handleStep1 = async () => {
    try {
      const result = await axios.post(
        `${serverUrl}/api/auth/send-otp`,
        { email },
        { withCredentials: true }
      );
      console.log(result);
      setStep(2);
    } catch (error) {
      console.log(error);
    }
  };

  // STEP 2 → Verify OTP
  const handleStep2 = async () => {
    try {
      const result = await axios.post(
        `${serverUrl}/api/auth/verify-otp`,
        { email, otp },
        { withCredentials: true }
      );
      console.log(result);
      setStep(3);
    } catch (error) {
      console.log(error);
    }
  };

  // STEP 3 → Reset Password
  const handleStep3 = async () => {
    if (newPassword !== confirmPassword) {
      console.log("Passwords do not match");
      return;
    }

    try {
      const result = await axios.post(
        `${serverUrl}/api/auth/reset-password`,
        { email, newPassword },
        { withCredentials: true }
      );
      console.log(result);
      navigate("/signin");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      {step === 1 && (
        <div>
          <h3>Forgot Password - Step 1</h3>
          <label>Email</label>
          <input
            type="email"
            placeholder="Enter your registered email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <br />
          <button onClick={handleStep1}>Send OTP</button>
        </div>
      )}

      {step === 2 && (
        <div>
          <h3>Forgot Password - Step 2</h3>
          <label>Enter OTP</label>
          <input
            type="text"
            placeholder="Enter OTP sent to your email"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <br />
          <button onClick={handleStep2}>Verify OTP</button>
        </div>
      )}

      {step === 3 && (
        <div>
          <h3>Forgot Password - Step 3</h3>
          <label>New Password</label>
          <input
            type="password"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <br />
          <label>Confirm Password</label>
          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <br />
          <button onClick={handleStep3}>Reset Password</button>
        </div>
      )}
    </div>
  );
};

export default ForgotPassword;
