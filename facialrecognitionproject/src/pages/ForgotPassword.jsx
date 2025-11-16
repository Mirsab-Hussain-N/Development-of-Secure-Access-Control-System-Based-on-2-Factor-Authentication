import React, { useState } from "react";
import forgotImage from "../assets/forgot.png";



const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleSendOTP = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://127.0.0.1:5000/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (response.ok) {
        alert(data.message);
        setStep(2);
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert("Server error while sending OTP");
      console.error(err);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://127.0.0.1:5000/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, new_password: newPassword }),
      });

      const data = await response.json();
      if (response.ok) {
        alert(data.message);
        window.location.href = "/login";
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert("Server error while resetting password");
      console.error(err);
    }
  };

  return (
    <div className="forgot-container">
      <div className="forgot-card">
        <div className="forgot-left">
          <img
            src={forgotImage}
            alt="Forgot Password Illustration"
            style={{ width: "300px", height: "auto", border: "1px solid red" }}
        />

        </div>

        <div className="forgot-right">
          {step === 1 ? (
            <>
              <h2>Forgot Password?</h2>
              <p>Enter the email address associated with your account.</p>
              <form onSubmit={handleSendOTP}>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button type="submit" className="filled-btn">Next</button>
              </form>
              <p className="try-another">Try another way</p>
            </>
          ) : (
            <>
              <h2>Reset Password</h2>
              <p>Enter the OTP you received and your new password below.</p>
              <form onSubmit={handleResetPassword}>
                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
                <input
                  type="password"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <button type="submit" className="filled-btn">Reset Password</button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
