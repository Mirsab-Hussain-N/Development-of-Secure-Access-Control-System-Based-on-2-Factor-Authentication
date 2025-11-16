import React, { useRef, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const LoginPage = () => {
  const videoRef = useRef(null);
  const [form, setForm] = useState({ email: "", password: "" });
  const [image, setImage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        videoRef.current.srcObject = stream;
      })
      .catch((err) => console.error("Camera error:", err));
  }, []);

  const captureImage = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 320;
    canvas.height = 240;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg");
    setImage(dataUrl);
    return dataUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const captured = captureImage();

    try {
      const response = await fetch("http://127.0.0.1:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, image: captured }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      alert(data.message || data.error);

      if (response.ok && data.message && !data.error) {
        // Save user info for dashboard
        localStorage.setItem("userName", data.name || form.email);
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Login error:", err);
      alert("Failed to connect to the server. Please make sure the backend is running.");
    }
  };

  return (
    <div className="container">
      <div className="form-box">
        <div className="left-section">
          <h2>Hello, Friend!</h2>
          <p>Register with your personal details to start your journey with us</p>
          <button className="outline-btn" onClick={() => navigate("/")}>
            SIGN UP
          </button>
        </div>

        <div className="right-section">
          <h2>Login</h2>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            width="100%"
            height="200"
            style={{ marginBottom: "15px", borderRadius: "8px" }}
          ></video>

          <form onSubmit={handleSubmit}>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
            <button type="submit" className="filled-btn">SIGN IN</button>
          </form>

          <p className="switch-text">
            Don't have an account? <Link to="/">Create one</Link>
          </p>

          <p className="switch-text">
            <Link to="/forgot-password">Forgot Password?</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
